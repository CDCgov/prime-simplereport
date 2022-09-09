package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.reflect.TypeToken;
import com.microsoft.applicationinsights.core.dependencies.google.gson.Gson;
import com.yannbriancon.interceptor.HibernateQueryInterceptor;
import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureHttpGraphQlTester;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.graphql.test.tester.WebGraphQlTester;
import org.springframework.http.HttpHeaders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

/** Base class for GraphQL API full-stack tests. */
@Slf4j
@AutoConfigureHttpGraphQlTester
public abstract class BaseGraphqlTest extends BaseFullStackTest {

  protected static final String ACCESS_ERROR = "Unauthorized";

  @Autowired private OrganizationInitializingService _initService;
  @Autowired private DemoOktaRepository _oktaRepo;
  @Autowired private DemoUserConfiguration _users;
  @Autowired protected HibernateQueryInterceptor _hibernateQueryInterceptor;
  @MockBean private AddressValidationService _addressValidation;

  private String _userName = null;
  private MultiValueMap<String, String> _customHeaders;

  @Autowired private WebGraphQlTester graphQlTester;

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

  protected void useSuperUserWithOrg() {
    _userName = TestUserIdentities.SITE_ADMIN_USER_WITH_ORG;
  }

  protected void useBrokenUser() {
    _userName = TestUserIdentities.BROKEN_USER;
  }

  /**
   * Add a custom header to a <b>single request</b> to be performed using {@link #runQuery}.
   *
   * @param name the HTTP header name (potentially subject to weird transformations--check your
   *     work!)
   * @param value the header value to be sent.
   */
  protected void addHeader(String name, String value) {
    _customHeaders.add(name, value);
  }

  @BeforeEach
  public void setup() {
    truncateDb();
    _oktaRepo.reset();
    when(_addressValidation.getValidatedAddress(any(), any()))
        .thenReturn(_dataFactory.getAddress());
    when(_addressValidation.getValidatedAddress(any(), any(), any(), any(), any(), any()))
        .thenReturn(_dataFactory.getAddress());
    TestUserIdentities.withStandardUser(_initService::initAll);
    useOrgUser();
    _customHeaders = new LinkedMultiValueMap<String, String>();
    assertNull(
        // Dear future reader: this is not negotiable. If you set a default user, then patients will
        // show up as being the default user instead of themselves. This would be bad.
        _users.getDefaultUser(), "default user should never be set in this application context");
    log.trace(
        "Usernames configured: {}",
        _users.getAllUsers().stream().map(DemoUser::getUsername).collect(Collectors.toList()));

    _hibernateQueryInterceptor.startQueryCount(); // also resets count
  }

  @AfterEach
  public void cleanup() {
    truncateDb();
    _userName = null;
    _oktaRepo.reset();

    // see output saved to backend/build/test-results/test
    LoggerFactory.getLogger(BaseGraphqlTest.class)
        .info("Hibernate Total queries: {}", _hibernateQueryInterceptor.getQueryCount());
  }

  private String getBearerAuth() {
    return DemoAuthenticationConfiguration.DEMO_AUTHORIZATION_FLAG + _userName;
  }

  protected ObjectNode runMultipart(LinkedMultiValueMap<String, Object> parts) {
    return null;
  }

  /** See {@link #runQuery(String, String, ObjectNode, String)}. */
  protected ObjectNode runQuery(String queryFileName) {
    return runQuery(queryFileName, null, null, null);
  }

  /**
   * Run the query in the given resource file, check if the response has the expected error (either
   * none or a single specific error message), and return the {@code data} section of the response
   * if the error was as expected.
   */
  protected ObjectNode runQuery(String queryFileName, String expectedError) {
    return runQuery(queryFileName, null, null, expectedError);
  }

  /** See {@link #runQuery(String,String,ObjectNode,String)}. */
  protected ObjectNode runQuery(String queryFileName, ObjectNode variables, String expectedError) {
    return runQuery(queryFileName, null, variables, expectedError);
  }

  /**
   * Run the query in the given resource file, check if the response has the expected error (either
   * none or a single specific error message), and return the {@code data} section of the response
   * if the error was as expected. <b>NOTE</b>: Any headers that have been set will be cleared at
   * the beginning of this method
   *
   * @param queryFileName the resource file name of the query (to be found in
   *     src/test/resources/queries, unless a "/" is found in the filename)
   * @param operationName the operation name from the query file, in the event that the query file
   *     is a multi-operation document.
   * @return the "data" key from the server response.
   */
  protected ObjectNode runQuery(
      String queryFileName, String operationName, ObjectNode variables, String expectedError) {
    // change variables to map everywhere! seems like this will continue to give us issues
    WebGraphQlTester webGraphQlTester =
        this.graphQlTester
            .mutate()
            .headers(HttpHeaders::clear)
            .headers(headers -> headers.setBearerAuth(getBearerAuth()))
            .headers(httpHeaders -> httpHeaders.addAll(_customHeaders))
            .build();

    System.out.println(queryFileName);
    GraphQlTester.Request<?> request = webGraphQlTester.documentName(queryFileName);

    if (operationName != null) {
      request.operationName(operationName);
    }

    if (variables != null) {
      Gson gson = new Gson();
      Type mapType = new TypeToken<Map<String, Object>>() {}.getType();
      Map<String, Object> variableMap = gson.fromJson(variables.toString(), mapType);
      variableMap.forEach(request::variable);
    }

    GraphQlTester.Response response = request.execute();
    if (expectedError != null) {
      response
          .errors()
          .satisfy(
              errors -> {
                assertThat(errors).hasSize(1);
                assertThat(errors.get(0).getMessage()).contains(expectedError);
              });
    }

    Object responseObject = response.path("").entity(Object.class).get();
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode jsonNodeMap = (ObjectNode) mapper.convertValue(responseObject, JsonNode.class);

    return jsonNodeMap;
  }

  protected ObjectNode runQuery(String queryFileName, ObjectNode variables) {
    return runQuery(queryFileName, null, variables, null);
  }

  /**
   * Check if the given response body has an {@code errors} section. If so, if we have an expected
   * error, check that the errors section contains it; if we do not, then fail the test.
   *
   * @param expectedError if null, expect success; if not null, expect this error message
   */
  protected static void assertGraphQLOutcome(JsonNode responseBody, String expectedError) {
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
      List<PhoneNumberInput> phoneNumbers,
      String lookupId,
      Optional<UUID> facilityId,
      Optional<String> expectedError) {

    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("firstName", firstName)
            .put("lastName", lastName)
            .put("birthDate", birthDate)
            .putPOJO("phoneNumbers", phoneNumbers)
            .put("lookupId", lookupId)
            .put("facilityId", facilityId.map(UUID::toString).orElse(null));
    return runQuery("add-person", variables, expectedError.orElse(null));
  }

  protected ObjectNode executeAddPersonMutation(
      String firstName,
      String lastName,
      String birthDate,
      String phone,
      String lookupId,
      Optional<UUID> facilityId,
      Optional<String> expectedError)
      throws IOException {

    return executeAddPersonMutation(
        firstName,
        lastName,
        birthDate,
        List.of(new PhoneNumberInput("MOBILE", phone)),
        lookupId,
        facilityId,
        expectedError);
  }

  protected void updateSelfPrivileges(
      Role role, boolean accessAllFacilities, Set<UUID> facilities) {
    String originalUsername = _userName;

    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    String id = who.get("id").asText();

    // cannot update own privileges, so need to switch to another profile
    if (originalUsername.equals(TestUserIdentities.ORG_ADMIN_USER)) {
      useSuperUser();
    } else {
      useOrgAdmin();
    }

    ObjectNode updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, role, accessAllFacilities, facilities);
    runQuery("update-user-privileges", updatePrivilegesVariables);

    _userName = originalUsername;
  }

  protected ObjectNode getUpdateUserPrivilegesVariables(
      String id, Role role, boolean accessAllFacilities, Set<UUID> facilities) {
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("id", id)
            .put("role", role.name())
            .put("accessAllFacilities", accessAllFacilities);
    variables
        .putArray("facilities")
        .addAll(
            facilities.stream()
                .map(f -> JsonNodeFactory.instance.textNode(f.toString()))
                .collect(Collectors.toSet()));
    return variables;
  }

  // map from each facility's name to its UUID; includes all facilities in organization
  protected Map<String, UUID> extractAllFacilitiesInOrg() {
    String originalUsername = _userName;
    useOrgAdmin();
    Iterator<JsonNode> facilitiesIter =
        runQuery("org-settings-query").get("organization").get("testingFacility").elements();
    Map<String, UUID> facilities = new HashMap<>();
    while (facilitiesIter.hasNext()) {
      JsonNode facility = facilitiesIter.next();
      facilities.put(facility.get("name").asText(), UUID.fromString(facility.get("id").asText()));
    }
    _userName = originalUsername;
    return facilities;
  }
}
