package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import java.util.Set;
import java.util.HashSet;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.function.Executable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;

import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
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
@Import(SliceTestConfiguration.class)
@WithSimpleReportStandardUser
public abstract class BaseServiceTest<T> {

    @Autowired
    private DbTruncator _truncator;
    @Autowired
    private OrganizationInitializingService _initService;
    @Autowired
    protected TestDataFactory _dataFactory;
    @Autowired
    protected T _service;

    private static final String SPRING_SECURITY_DENIED = "Access is denied";

    @BeforeEach
    protected void before() {
        clearDb();
    }

    public void clearDb() {
        _truncator.truncateAll();
    }

    protected void initSampleData() {
        _initService.initAll();
    }

    protected void reset() {
        _truncator.truncateAll();
    }

    protected static void assertSecurityError(Executable e) {
        AccessDeniedException exception = assertThrows(AccessDeniedException.class, e);
        assertEquals(SPRING_SECURITY_DENIED, exception.getMessage());
    }
}
