package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import com.graphql.spring.boot.test.GraphQLTestTemplate;
import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.util.Optional;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.opentest4j.AssertionFailedError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class BaseApiTest {

  private static final Logger LOG = LoggerFactory.getLogger(BaseApiTest.class);

  protected static final String ACCESS_ERROR =
      "Current user does not have permission for this action";

  @Autowired private DbTruncator _truncator;
  @Autowired private OrganizationInitializingService _initService;
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private DemoOktaRepository _oktaRepo;
  @Autowired private GraphQLTestTemplate _template;
  @Autowired private DemoUserConfiguration _users;
  @MockBean protected AddressValidationService _addressValidation;

  private String _userName = null;

  protected void truncateDb() {
    _truncator.truncateAll();
  }

  protected void useOrgUser() {
    _userName = TestUserIdentities.STANDARD_USER;
  }

  protected void useOutsideOrgUser() {
    _userName = TestUserIdentities.OTHER_ORG_USER;
  }

  protected void useOrgAdmin() {
    _userName = TestUserIdentities.ORG_ADMIN_USER;
  }

  protected void useOutsideOrgAdmin() {
    _userName = TestUserIdentities.OTHER_ORG_ADMIN;
  }

  protected void useOrgEntryOnly() {
    _userName = TestUserIdentities.ENTRY_ONLY_USER;
  }

  protected void useOrgUserAllFacilityAccess() {
    _userName = TestUserIdentities.ALL_FACILITIES_USER;
  }

  protected void useSuperUser() {
    _userName = TestUserIdentities.SITE_ADMIN_USER;
  }

  protected void useBrokenUser() {
    _userName = TestUserIdentities.BROKEN_USER;
  }

  @BeforeEach
  public void setup() {
    truncateDb();
    _oktaRepo.reset();
    when(_addressValidation.getValidatedAddress(any(), any()))
        .thenReturn(_dataFactory.getAddress());
    TestUserIdentities.withStandardUser(
        () -> {
          _initService.initAll();
        });
    useOrgUser();
    assertNull(
        // Dear future reader: this is not negotiable. If you set a default user, then patients will
        // show up as being the default user instead of themselves. This would be bad.
        _users.getDefaultUser(), "default user should never be set in this application context");
    LOG.trace(
        "Usernames configured: {}",
        _users.getAllUsers().stream().map(DemoUser::getUsername).collect(Collectors.toList()));
  }

  @AfterEach
  public void cleanup() {
    truncateDb();
    _userName = null;
    _oktaRepo.reset();
  }

  /**
   * Run the query in the given resource file, check if the response has errors, and return the
   * {@code data} section of the response if not. <b>NOTE</b>: Any headers that have been set on the
   * {@link GraphQLTestTemplate} will be cleared at the beginning of this method: if you need to set
   * them, modify the {{@link #setQueryUser(String)} method, or add another method that is called
   * after it!
   *
   * @param queryFileName
   * @return the "data" key from the server response.
   * @throws AssertionFailedError if the response has errors
   * @throws RuntimeException for unexpected errors
   */
  protected ObjectNode runQuery(String queryFileName) {
    try {
      setQueryUser(_userName);
      GraphQLResponse response = _template.postForResource(queryFileName);
      assertEquals(HttpStatus.OK, response.getStatusCode(), "Servlet response should be OK");
      JsonNode responseBody = response.readTree();
      assertGraphQLOutcome(responseBody, null);
      return (ObjectNode) responseBody.get("data");
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  /** CLEAR ALL HEADERS and then set the Authorization header the requested value */
  private void setQueryUser(String username) {
    LOG.info("Setting up graphql template authorization for {}", username);
    _template.clearHeaders();
    _template.addHeader(
        "Authorization", DemoAuthenticationConfiguration.DEMO_AUTHORIZATION_FLAG + username);
  }

  /**
   * Run the query in the given resource file, check if the response has the expected error (either
   * none or a single specific error message), and return the {@code data} section of the response
   * if the error was as expected.
   */
  protected ObjectNode runQuery(String queryFileName, String expectedError) {
    return runQuery(queryFileName, null, expectedError);
  }

  /**
   * Run the query in the given resource file, check if the response has the expected error (either
   * none or a single specific error message), and return the {@code data} section of the response
   * if the error was as expected. <b>NOTE</b>: Any headers that have been set on the {@link
   * GraphQLTestTemplate} will be cleared at the beginning of this method: if you need to set them,
   * modify the {{@link #setQueryUser(String)} method, or add another method that is called after
   * it!
   */
  protected ObjectNode runQuery(String queryFileName, ObjectNode variables, String expectedError) {
    try {
      setQueryUser(_userName);
      GraphQLResponse response = _template.perform(queryFileName, variables);
      assertEquals(HttpStatus.OK, response.getStatusCode(), "Servlet response should be OK");
      JsonNode responseBody = response.readTree();
      assertGraphQLOutcome(responseBody, expectedError);
      return (ObjectNode) responseBody.get("data");
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  protected ObjectNode runQuery(String queryFileName, ObjectNode variables) {
    return runQuery(queryFileName, variables, null);
  }

  /**
   * Check if the given response has an {@code errors} section, and if so, fail the test using the
   * errors section as a failure message.
   */
  protected static void assertGraphQLSuccess(GraphQLResponse resp) {
    try {
      assertGraphQLOutcome(resp.readTree(), null);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Check if the given response body has an {@code errors} section. If so, if we have an expected
   * error, check that the errors section contains it; if we do not, then fail the test.
   *
   * @param expectedError if null, expect success; if not null, expect this error message
   */
  protected static void assertGraphQLOutcome(JsonNode responseBody, String expectedError) {
    System.out.println("\n\n\n\n\n\nRESPONSE=" + responseBody.toPrettyString());
    JsonNode errorNode = responseBody.path("errors");
    if (null == expectedError) {
      if (!errorNode.isMissingNode()) {
        fail(errorNode.toString());
      }
    } else {
      assertThat(errorNode.get(0).get("message").asText()).contains(expectedError);
    }
  }

  protected ObjectNode executeAddPersonMutation(
      String firstName,
      String lastName,
      String birthDate,
      String phone,
      String lookupId,
      Optional<String> expectedError)
      throws IOException {
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("firstName", firstName)
            .put("lastName", lastName)
            .put("birthDate", birthDate)
            .put("telephone", phone)
            .put("lookupId", lookupId);
    return runQuery("add-person", variables, expectedError.orElse(null));
  }
}
