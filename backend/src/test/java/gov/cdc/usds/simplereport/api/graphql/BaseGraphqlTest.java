package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yannbriancon.interceptor.HibernateQueryInterceptor;
import gov.cdc.usds.simplereport.api.BaseAuthenticatedFullStackTest;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
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
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.graphql.test.tester.WebGraphQlTester;
import org.springframework.http.HttpHeaders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

/** Base class for GraphQL API full-stack tests. */
@Slf4j
@AutoConfigureHttpGraphQlTester
public abstract class BaseGraphqlTest extends BaseAuthenticatedFullStackTest {

  @Autowired protected HibernateQueryInterceptor hibernateQueryInterceptor;

  private MultiValueMap<String, String> customHeaders;

  @Autowired private WebGraphQlTester graphQlTester;

  /**
   * Add a custom header to a <b>single request</b> to be performed.
   *
   * @param name the HTTP header name (potentially subject to weird transformations--check your
   *     work!)
   * @param value the header value to be sent.
   */
  protected void addHeader(String name, String value) {
    customHeaders.add(name, value);
  }

  @BeforeEach
  public void setup() {
    customHeaders = new LinkedMultiValueMap<>();
    hibernateQueryInterceptor.startQueryCount(); // also resets count
  }

  @AfterEach
  public void cleanup() {
    // see output saved to backend/build/test-results/test
    LoggerFactory.getLogger(BaseGraphqlTest.class)
        .info("Hibernate Total queries: {}", hibernateQueryInterceptor.getQueryCount());
  }

  /** See {@link #runQuery(String, String, Map, String)}. */
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

  /** See {@link #runQuery(String,String,Map,String)}. */
  protected ObjectNode runQuery(
      String queryFileName, Map<String, Object> variables, String expectedError) {
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
      String queryFileName,
      String operationName,
      Map<String, Object> variables,
      String expectedError) {
    // change variables to map everywhere! seems like this will continue to give us issues
    WebGraphQlTester webGraphQlTester =
        this.graphQlTester
            .mutate()
            .headers(HttpHeaders::clear)
            .headers(headers -> headers.setBearerAuth(getBearerAuth()))
            .headers(httpHeaders -> httpHeaders.addAll(customHeaders))
            .build();

    GraphQlTester.Request<?> request = webGraphQlTester.documentName(queryFileName);

    if (operationName != null) {
      request.operationName(operationName);
    }

    if (variables != null) {
      variables.forEach(request::variable);
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

  protected ObjectNode runQuery(String queryFileName, Map<String, Object> variables) {
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

    Map<String, Object> variables =
        new HashMap<>(
            Map.of(
                "firstName", firstName,
                "lastName", lastName,
                "birthDate", birthDate,
                "phoneNumbers", phoneNumbers,
                "lookupId", lookupId));

    facilityId.ifPresent(uuid -> variables.put("facilityId", uuid.toString()));

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
    String originalUsername = this.getUsername();

    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    String id = who.get("id").asText();

    // cannot update own privileges, so need to switch to another profile
    if (originalUsername.equals(TestUserIdentities.ORG_ADMIN_USER)) {
      useSuperUser();
    } else {
      useOrgAdmin();
    }

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, role, accessAllFacilities, facilities);
    runQuery("update-user-privileges", updatePrivilegesVariables);

    setUsername(originalUsername);
  }

  protected Map<String, Object> getUpdateUserPrivilegesVariables(
      String id, Role role, boolean accessAllFacilities, Set<UUID> facilities) {

    return Map.of(
        "id",
        id,
        "role",
        role.name(),
        "accessAllFacilities",
        accessAllFacilities,
        "facilities",
        facilities.stream()
            .map(f -> JsonNodeFactory.instance.textNode(f.toString()))
            .collect(Collectors.toSet()));
  }

  // map from each facility's name to its UUID; includes all facilities in organization
  protected Map<String, UUID> extractAllFacilitiesInOrg() {
    String originalUsername = getUsername();
    useOrgAdmin();
    Iterator<JsonNode> facilitiesIter =
        runQuery("org-settings-query")
            .get("whoami")
            .get("organization")
            .get("testingFacility")
            .elements();
    Map<String, UUID> facilities = new HashMap<>();
    while (facilitiesIter.hasNext()) {
      JsonNode facility = facilitiesIter.next();
      facilities.put(facility.get("name").asText(), UUID.fromString(facility.get("id").asText()));
    }
    setUsername(originalUsername);
    return facilities;
  }
}
