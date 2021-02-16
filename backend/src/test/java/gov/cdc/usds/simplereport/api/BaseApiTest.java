package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.Collections;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import com.graphql.spring.boot.test.GraphQLTestTemplate;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class BaseApiTest {

    protected static final String ACCESS_ERROR = "Current user does not have permission for this action";

    @Autowired
    private DbTruncator _truncator;
    @Autowired
    protected OrganizationInitializingService _initService;
    @Autowired
    protected GraphQLTestTemplate _template; // screw delegation
    @MockBean
    protected AuthorizationService _authService;
    @MockBean
    protected IdentitySupplier _supplier;
    @MockBean
    protected OktaRepository _oktaRepo;

    private static final List<OrganizationRoleClaims> USER_ORG_ROLES = 
            Collections.singletonList(new OrganizationRoleClaims("DIS_ORG", Set.of(OrganizationRole.USER)));
    private static final List<OrganizationRoleClaims> OUTSIDE_USER_ORG_ROLES = 
            Collections.singletonList(new OrganizationRoleClaims("DAT_ORG", Set.of(OrganizationRole.USER)));
    private static final List<OrganizationRoleClaims> ADMIN_ORG_ROLES = 
            Collections.singletonList(new OrganizationRoleClaims("DIS_ORG", Set.of(OrganizationRole.USER,
                                                                              OrganizationRole.ADMIN)));
    private static final List<OrganizationRoleClaims> OUTSIDE_ADMIN_ORG_ROLES = 
            Collections.singletonList(new OrganizationRoleClaims("DAT_ORG", Set.of(OrganizationRole.USER,
                                                                              OrganizationRole.ADMIN)));
    private static final List<OrganizationRoleClaims> ENTRY_ONLY_ORG_ROLES = 
            Collections.singletonList(new OrganizationRoleClaims("DIS_ORG", Set.of(OrganizationRole.USER,
                                                                              OrganizationRole.ENTRY_ONLY)));

    protected void truncateDb() {
        _truncator.truncateAll();
    }

    protected void useOrgUser() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for org user");
        when(_supplier.get()).thenReturn(TestUserIdentities.STANDARD_USER_ATTRIBUTES);
        when(_authService.findAllOrganizationRoles()).thenReturn(USER_ORG_ROLES);
    }

    protected void useOutsideOrgUser() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for outside org user");
        when(_supplier.get()).thenReturn(TestUserIdentities.STANDARD_USER_ATTRIBUTES);
        when(_authService.findAllOrganizationRoles()).thenReturn(OUTSIDE_USER_ORG_ROLES);
    }

    protected void useOrgAdmin() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for org admin");
        when(_supplier.get()).thenReturn(TestUserIdentities.STANDARD_USER_ATTRIBUTES);
        when(_authService.findAllOrganizationRoles()).thenReturn(ADMIN_ORG_ROLES);
    }

    protected void useOutsideOrgAdmin() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for outside org admin");
        when(_supplier.get()).thenReturn(TestUserIdentities.STANDARD_USER_ATTRIBUTES);
        when(_authService.findAllOrganizationRoles()).thenReturn(OUTSIDE_ADMIN_ORG_ROLES);
    }

    protected void useOrgEntryOnly() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring auth service mock for org entry-only");
        when(_supplier.get()).thenReturn(TestUserIdentities.STANDARD_USER_ATTRIBUTES);
        when(_authService.findAllOrganizationRoles()).thenReturn(ENTRY_ONLY_ORG_ROLES);
    }

    protected void useSuperUser() {
        LoggerFactory.getLogger(BaseApiTest.class).info("Configuring supplier mock for super user");
        when(_supplier.get()).thenReturn(TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES);
    }

    protected void setRoles(Set<OrganizationRole> roles) {
        List<OrganizationRoleClaims> orgRoles;
        if (roles != null && !roles.isEmpty()) {
            orgRoles = Collections.singletonList(new OrganizationRoleClaims("DIS_ORG", roles));
        } else {
            orgRoles = Collections.emptyList();
        }
        when(_authService.findAllOrganizationRoles()).thenReturn(orgRoles);
    }

    @BeforeEach
    public void setup() {
        truncateDb();
        useOrgUser();
        _initService.initAll();
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
    protected ObjectNode runQuery(String queryFileName, String expectedError) {
        return runQuery(queryFileName, null, expectedError);
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
            //TODO remove
            System.out.print("PRETTY OUTPUT:"+responseBody.toPrettyString());
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

    protected GraphQLResponse executeAddPersonMutation(String firstName, String lastName, String birthDate,
            String phone, String lookupId)
            throws IOException {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
                .put("firstName", firstName)
                .put("lastName", lastName)
                .put("birthDate", birthDate)
                .put("telephone", phone)
                .put("lookupId", lookupId);
        return _template.perform("add-person", variables);
    }
}
