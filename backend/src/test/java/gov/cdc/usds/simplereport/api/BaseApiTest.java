package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Arrays;
import java.util.Set;
import java.util.HashSet;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import com.graphql.spring.boot.test.GraphQLTestTemplate;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.OktaService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;

import com.okta.spring.boot.sdk.config.OktaClientProperties;
import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.group.Group;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class BaseApiTest {

    protected static final String ACCESS_ERROR = "Current user does not have permission for this action";

    @Autowired
    private DbTruncator _truncator;
    @Autowired
    protected OrganizationInitializingService _initService;

    @Autowired
    protected GraphQLTestTemplate _template; // screw delegation

    @Autowired
    protected AuthorizationProperties _authorizationProperties;
    @Autowired
    private OktaClientProperties _oktaClientProperties;

    @MockBean
    protected AuthorizationService _authService;
    @MockBean
    protected IdentitySupplier _supplier;
    @MockBean
    protected OktaService _oktaService;

    protected Client _oktaClient;

    private static final List<OrganizationRoles> USER_ORG_ROLES = 
            Arrays.asList(new OrganizationRoles("DIS_ORG", Set.of(OrganizationRole.USER)));
    private static final List<OrganizationRoles> ADMIN_ORG_ROLES = 
            Arrays.asList(new OrganizationRoles("DIS_ORG", Set.of(OrganizationRole.USER,
                                                                  OrganizationRole.ADMIN)));

    protected void truncateDb() {
        _truncator.truncateAll();
    }

    public void initOkta() {
        _oktaClient = Clients.builder()
                .setOrgUrl(_oktaClientProperties.getOrgUrl())
                .setClientCredentials(new TokenClientCredentials(_oktaClientProperties.getToken()))
                .build();
        clearOktaUsers();
        clearOktaGroups();
    }

    // Override this in any derived Test class that creates Okta users
    protected Set<String> getOktaTestUsernames() {
        return new HashSet<String>();
    }
    
    protected void clearOktaUsers() {
        for (User u : _oktaClient.listUsers()) {
            if (getOktaTestUsernames().contains(u.getProfile().getLogin())) {
                u.deactivate();
                u.delete();
            }
        }
    }

    protected void clearOktaGroups() {
        for (Group g : _oktaClient.listGroups()) {
            String groupName = g.getProfile().getName();
            if (groupName.startsWith(_authorizationProperties.getRolePrefix())) {
                g.delete();
            }
        }
    }

    protected void useOrgUser() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for org user");
        when(_supplier.get()).thenReturn(TestUserIdentities.STANDARD_USER_ATTRIBUTES);
        when(_authService.findAllOrganizationRoles()).thenReturn(USER_ORG_ROLES);
    }

    protected void useOrgAdmin() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for org admin");
        when(_authService.findAllOrganizationRoles()).thenReturn(ADMIN_ORG_ROLES);
    }

    protected void useSuperUser() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for super user");
        when(_supplier.get()).thenReturn(TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES);
    }

    @BeforeEach
    public void setup() {
        truncateDb();
        useOrgUser();
        initOkta();
        _initService.initAll();
    }

    @AfterEach
    public void cleanup() {
        truncateDb();
        clearOktaUsers();
        clearOktaGroups();
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
            assertEquals(HttpStatus.OK, response.getStatusCode(), "Servlet response should be OK");
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
            assertThat(errorNode.get(0).get("message").asText()).contains(expectedError);
        }
    }
}
