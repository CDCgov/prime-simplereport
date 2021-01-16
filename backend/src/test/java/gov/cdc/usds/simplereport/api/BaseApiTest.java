package gov.cdc.usds.simplereport.api;

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
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import com.graphql.spring.boot.test.GraphQLTestTemplate;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.OktaService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
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

    @MockBean
    protected OktaService _oktaService;

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
            assertGraphQLSuccess(responseBody);
            return (ObjectNode) responseBody.get("data");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected ObjectNode runQuery(String queryFileName, ObjectNode variables) {
        try {
            GraphQLResponse response = _template.perform(queryFileName, variables);
            assertTrue(response.isOk(), "Servlet response should be OK");
            JsonNode responseBody = response.readTree();
            assertGraphQLSuccess(responseBody);
            return (ObjectNode) responseBody.get("data");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Check if the given response has an {@code errors} section, and if so,
     * fail the test using the errors section as a failure message.
     */
    protected static void assertGraphQLSuccess(GraphQLResponse resp) {
        try {
            assertGraphQLSuccess(resp.readTree());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Check if the given response body has an {@code errors} section, and if
     * so, fail the test using the errors section as a failure message.
     */
    protected static void assertGraphQLSuccess(JsonNode responseBody) {
        JsonNode errorNode = responseBody.path("errors");
        if (!errorNode.isMissingNode()) {
            fail(errorNode.toString());
        }
    }
}
