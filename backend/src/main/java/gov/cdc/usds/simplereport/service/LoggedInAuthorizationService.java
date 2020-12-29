package gov.cdc.usds.simplereport.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;

@Service
public class LoggedInAuthorizationService implements AuthorizationService {

    private OrganizationExtractor _extractor;
    private OrganizationInitializingService _initService;

    public LoggedInAuthorizationService(OrganizationExtractor _extractor, OrganizationInitializingService _initService) {
        super();
        this._extractor = _extractor;
        this._initService = _initService;
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
