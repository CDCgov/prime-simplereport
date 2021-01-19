package gov.cdc.usds.simplereport.service;

import java.util.Set;
import java.util.HashSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

import com.okta.spring.boot.sdk.config.OktaClientProperties;
import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.group.Group;
import com.okta.sdk.resource.group.GroupType;

import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;

import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Base class for service-level integration. Avoids setting up servlet and web
 * security, but sets up service and persistence layer.
 *
 * Note that when service-layer security is configured, it will mysteriously not
 * work in tests because security configuration is attached to a web security
 * configuration module. (That module is also on the wrong profile, so there's a
 * significant rearrangement required regardless.)
 */
@SpringBootTest(properties = {
        "spring.main.web-application-type=NONE",
        "simple-report.authorization.role-prefix=TEST-TENANT:",
})
@ActiveProfiles({"okta-dev","dev"})
@WithMockUser(authorities = { "TEST-TENANT:DIS_ORG:USER" })
@EnableConfigurationProperties({OktaClientProperties.class, AuthorizationProperties.class})
public abstract class BaseServiceTest<T> {

    @Autowired
    private DbTruncator _truncator;
    @Autowired
    private OrganizationInitializingService _initService;
    @Autowired
    protected TestDataFactory _dataFactory;
    @Autowired
    protected T _service;
    @Autowired
    protected AuthorizationProperties _authorizationProperties;
    @Autowired
    private OktaClientProperties _oktaClientProperties;

    protected Client _oktaClient;

    @BeforeEach
    protected void before() {
        clearDb();
        initOkta();
    }

    public void clearDb() {
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

    @AfterEach
    protected void after() {
        clearOktaUsers();
        clearOktaGroups();
    }

    protected void clearOktaUsers() {
        for (User u : _oktaClient.listUsers()) {
            if (getOktaTestUsernames().contains(u.getProfile().getLogin())) {
                u.delete();
            }
        }
    }

    // Override this in any derived Test class that creates Okta users
    protected Set<String> getOktaTestUsernames() {
        return new HashSet<String>();
    }

    protected void clearOktaGroups() {
        for (Group g : _oktaClient.listGroups()) {
            String groupName = g.getProfile().getName();
            if (g.getType() == GroupType.OKTA_GROUP &&
                        groupName.startsWith(_authorizationProperties.getRolePrefix())) {
                g.delete();
            }
        }
    }

    protected void initSampleData() {
        _initService.initAll();
    }

    protected void reset() {
        _truncator.truncateAll();
    }
}
