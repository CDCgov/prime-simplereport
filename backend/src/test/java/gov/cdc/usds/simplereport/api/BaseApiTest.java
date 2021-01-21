package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Collections;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import com.graphql.spring.boot.test.GraphQLTestTemplate;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class BaseApiTest {

    private static final OrganizationRoles DEFAULT_ORG = new OrganizationRoles("DIS_ORG",
            Collections.singleton(OrganizationRole.USER));

    @Autowired
    private DbTruncator _truncator;
    @Autowired
    private OrganizationInitializingService _initService;

    @Autowired
    protected GraphQLTestTemplate _template; // screw delegation

    @MockBean
    protected AuthorizationService _authService;

    protected void truncateDb() {
        _truncator.truncateAll();
    }

    @BeforeEach
    public void setup() {
        truncateDb();
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock");
        _initService.initAll();
        when(_authService.findAllOrganizationRoles()).thenReturn(Collections.singletonList(DEFAULT_ORG));
    }

    @AfterEach
    public void cleanup() {
        truncateDb();
    }

    /**
     * Run the query in the given resource file, check if the response has
     * errors, and return the {@code data} section of the response if not.
     * 
     * @param queryFileName
     * @return the "data" key from the server response.
     * @throws AssertionFailedError if the response has errors
     * @throws RuntimeException     for unexpected errors
     */
    protected ObjectNode runQuery(String queryFileName) {
        try {
            GraphQLResponse response = _template.postForResource(queryFileName);
            assertTrue(response.isOk(), "Servlet response should be OK");
            JsonNode responseBody = response.readTree();
            assertGraphQLOutcome(responseBody, null);
            return (ObjectNode) responseBody.get("data");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Run the query in the given resource file, check if the response has the
     * expected error (either none or a single specific error message), and return
     * the {@code data} section of the response if the error was as expected.
     */
    protected ObjectNode runQuery(String queryFileName, ObjectNode variables, String expectedError) {
        try {
            GraphQLResponse response = _template.perform(queryFileName, variables);
            assertTrue(response.isOk(), "Servlet response should be OK");
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
     * Check if the given response has an {@code errors} section, and if so,
     * fail the test using the errors section as a failure message.
     */
    protected static void assertGraphQLSuccess(GraphQLResponse resp) {
        try {
            assertGraphQLOutcome(resp.readTree(), null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Check if the given response body has an {@code errors} section. If so, if we
     * have an expected error, check that the errors section contains it; if we do
     * not, then fail the test.
     * 
     * @param expectedError if null, expect success; if not null, expect this error
     *                      message
     */
    protected static void assertGraphQLOutcome(JsonNode responseBody, String expectedError) {
        JsonNode errorNode = responseBody.path("errors");
        if (null == expectedError) {
            if (!errorNode.isMissingNode()) {
                fail(errorNode.toString());
            }
        } else {
            assertEquals(expectedError, errorNode.get(0).get("message").asText());
        }
    }
}
