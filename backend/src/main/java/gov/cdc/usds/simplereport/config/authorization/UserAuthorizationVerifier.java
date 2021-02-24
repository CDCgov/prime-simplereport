package gov.cdc.usds.simplereport.config.authorization;

import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedUserException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Authorization translation bean: looks at the current user and tells you what
 * things they can do.
 */
@Component(AuthorizationConfiguration.AUTHORIZER_BEAN)
public class UserAuthorizationVerifier {
    private static final Logger LOG = LoggerFactory.getLogger(UserAuthorizationVerifier.class);

    private SiteAdminEmailList _admins;
    private IdentitySupplier _supplier;
    private OrganizationService _orgService;
    private ApiUserRepository _userRepo;
    private OktaRepository _oktaRepo;

    public UserAuthorizationVerifier(SiteAdminEmailList admins, 
                                     IdentitySupplier supplier, 
                                     OrganizationService orgService,
                                     ApiUserRepository userRepo,
                                     OktaRepository oktaRepo) {
        super();
        this._admins = admins;
        this._supplier = supplier;
        this._orgService = orgService;
        this._userRepo = userRepo;
        this._oktaRepo = oktaRepo;
    }

    public boolean userHasSiteAdminRole() {
        isValidUser();
        IdentityAttributes id = _supplier.get();
        return id != null && _admins.contains(id.getUsername());
    }

    public boolean userHasPermission(UserPermission permission) {
        isValidUser();
        Optional<OrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
        // more troubleshooting help here.
        // Note: if your not reaching this code, then grep for 'AbstractAccessDecisionManager.accessDenied' in
        // spring library AffirmativeBased.java and set a breakpoint there.
        if (orgRoles.isEmpty()) {
            LOG.warn("Permission request for {} failed. No roles for org defined.", permission);
            return false;
        }
        if (!orgRoles.get().getGrantedPermissions().contains(permission)) {
            LOG.warn("Permissions request for {} failed. Not a granted permission.", permission);
            return false;
        }
        return true;
    }

    public boolean userIsInSameOrg(UUID userId) {
        isValidUser();
        Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
        String otherUserEmail = getUser(userId).getLoginEmail();
        Optional<Organization> otherOrg = _oktaRepo.getOrganizationRoleClaimsForUser(otherUserEmail)
                .map(r -> _orgService.getOrganization(r.getOrganizationExternalId()));
        return currentOrgRoles.isPresent() && otherOrg.isPresent() &&
                currentOrgRoles.get().getOrganization().getExternalId().equals(otherOrg.get().getExternalId());

    }

    private void isValidUser() {
        IdentityAttributes id = _supplier.get();
        if (id == null) {
            throw new UnidentifiedUserException();
        }
        Optional<ApiUser> found = _userRepo.findByLoginEmail(id.getUsername());
        if (!found.isPresent()) {
            throw new NonexistentUserException();
        }
    }

    // This replicates getUser() in ApiUserService.java, but we cannot call that logic directly or else that method
    // would have to either a) become public with no method-level security, which is bad; or b) become public with
    // method-level security that invokes an above method which creates a circular loop with this method.
    private ApiUser getUser(UUID id) {
        Optional<ApiUser> found = _userRepo.findById(id);
        return found.orElseThrow(NonexistentUserException::new);
    }
}
