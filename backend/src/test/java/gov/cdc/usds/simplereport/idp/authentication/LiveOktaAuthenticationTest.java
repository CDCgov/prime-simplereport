package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import com.okta.spring.boot.sdk.config.OktaClientProperties;

// need to make sure the okta org url and token are passed in here (they currently aren't, probably
// need to pass to application-default.yaml)

// once the LiveOktaAuthentication object is configured, then we need to start making calls to the
// API
// first step is to create a user (unactivated):
// https://developer.okta.com/docs/reference/api/users/#request-example
// send a fake user, with fake email and name.
// then extract the activation token out of the returned link (this might be tricky, because it's
// returned as part of a URL)

// once the user has been created, go through the MFA flow
// call the set password/recovery questions methods
// then make a separate API call for the user's credentials, and ensure that the password and
// recovery questions were set correctly

// same thing for MFA options: enroll the user in MFA, verify through the API that it's WAI, then
// tear down the MFA option
// (this is probably easier than creating users for each new MFA type)

// at the end of the test, use the API to delete the test user (a permanent deletion, so that we can
// successfully run on the same email later)

// also need to test unsuccessful cases: what kind of error is thrown when the activation link is
// invalid? When the password doesn't meet standards? etc

// something to consider: how do we make sure that this test only runs when called for, rather than
// auto-running as part of `gradle test`?
// also, how do we make sure it's not called on every github upload?

// @Import(SliceTestConfiguration.class)
@TestInstance(Lifecycle.PER_CLASS)
// @Import(LiveOktaAuthentication.class)
@SpringBootTest
public class LiveOktaAuthenticationTest {

  // @Value("${okta.client.org-url}")
  private String _orgUrl;

  // @Value("${okta.client.token}")
  private String _token;

  @Autowired private LiveOktaAuthentication _auth;

  @Autowired private TestRestTemplate _restTemplate;

  // private RestTemplate _restTemplate;

  private JSONObject _createUserResponse;

  private String _activatedUserId;

  @BeforeAll
  void initializeUser() {
    System.out.println("IN TEST INITIALIZATION");
    System.out.println(_auth);
    // _auth = new LiveOktaAuthentication(_orgUrl, _token);
    _orgUrl = _auth.getOrgUrl();
    _token = _auth.getApiToken();
    System.out.println("orgUrl: " + _orgUrl);

    // _restTemplate = new RestTemplate();
    _createUserResponse = createUser();
    _activatedUserId = _createUserResponse.getString("id");
  }

  @AfterAll
  void tearDownUser() {
    // hard-delete the user in Okta
  }

  // Positive Tests
  @Test
  void testActivationSuccessful() throws Exception {
    System.out.println("IN TESTACTIVATIONSUCCESSFUL");
    String href =
        _createUserResponse.getJSONObject("_links").getJSONObject("activate").getString("href");
    String activationToken = StringUtils.substringBetween(href, "/users/", "/lifecycle/");
    String userId = _auth.activateUser(activationToken, "", "");

    // assert that the user id returned is the same as the created user
    assertThat(userId).isEqualTo(_activatedUserId);

    // assert that the user is activated in Okta
    JSONObject response = getUser(userId);
    assertThat(response.getString("activated")).isNotNull();
  }

  @Test
  void setPasswordSuccessful() throws Exception {
    String password = "fooBAR123";
    _auth.setPassword(_activatedUserId, password.toCharArray());

    JSONObject getUserResponse = getUser(_activatedUserId);

    // assert that the password has been set in Okta
    assertThat(getUserResponse.getJSONObject("credentials").getString("password")).isEqualTo(password);
  }

  @Test
  void setRecoveryQuestionSuccessful() throws Exception {
    _auth.setRecoveryQuestion(_activatedUserId, "Who was your third grade teacher?", "Jane Doe");

  }

  // Negative Tests
  @Test
  void testActivationFails_withInvalidToken() {
    Exception exception = assertThrows(
        InvalidActivationLinkException.class,
        () -> {
          _auth.activateUser("invalidActivationToken", "", "");
        });
    assertThat(exception).hasMessage("User could not be activated");
  }

  @Test
  void setPasswordFails_withInvalidPassword() {
    Exception exception = assertThrows(
      OktaAuthenticationFailureException.class, 
      () -> {
        _auth.setPassword(_activatedUserId, "short".toCharArray());
      });
      assertThat(exception).hasMessage("Error setting user's password");
  }

  // WARNING: this issues an actual API call to Okta and creates an actual user! beware!
  // note to self: how to create this user under the correct organization? might be something like
  // "https://hhs-prime.okta.com/organization=123/api/v1/users?activate=false"
  private JSONObject createUser() {
    JSONObject requestBody = new JSONObject();
    JSONObject profile = new JSONObject();
    profile.put("firstName", "TEST");
    profile.put("lastName", "INTEGRATION");
    profile.put("email", "test@example.com");
    profile.put("login", "test@example.com");
    profile.put("mobilePhone", "999-999-9999");
    requestBody.put("profile", profile);
    HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), createHeaders());
    String postUrl = _orgUrl + "/api/v1/users?activate=false";
    try {
      RestTemplate restTemplate = new RestTemplate();
      String response = restTemplate.postForObject(postUrl, entity, String.class);
      System.out.println("CREATE USER RESPONSE: " + response);
      return new JSONObject(response);
    } catch (Exception e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while creating the user: ", e);
    }
  }

  private JSONObject getUser(String userId) {
    HttpEntity<String> entity = new HttpEntity<>("", createHeaders());
    String postUrl = _orgUrl + "/api/v1/users/" + userId;
    RestTemplate restTemplate = new RestTemplate();
    String response = restTemplate.postForObject(postUrl, entity, String.class);
    System.out.println("GET USER RESPONSE:" + response);
    return new JSONObject(response);
  }

  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.add("Authorization", "SSWS " + _token);
    return headers;
  }
}
