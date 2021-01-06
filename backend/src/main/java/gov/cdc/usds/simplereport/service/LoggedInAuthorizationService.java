package gov.cdc.usds.simplereport.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;

/**
 * Real-world implementation of AuthorizationService: should eventually be able
 * to be the only implementation, when we have fully mocked-out
 * local-dev/demo/test authentication.
 */
public class LoggedInAuthorizationService implements AuthorizationService {

    private OrganizationExtractor _extractor;
    private OrganizationInitializingService _initService;

    public LoggedInAuthorizationService(OrganizationExtractor extractor, OrganizationInitializingService initService) {
        super();
        this._extractor = extractor;
        this._initService = initService;
    }

    @Override
    public List<OrganizationRoles> findAllOrganizationRoles() {
        _initService.initAll();
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth == null) {
            throw new RuntimeException("Nobody is currently authenticated");
        }
        return _extractor.convert(currentAuth.getAuthorities());
    }
}
