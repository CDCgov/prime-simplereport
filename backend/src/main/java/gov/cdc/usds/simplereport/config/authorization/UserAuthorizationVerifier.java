package gov.cdc.usds.simplereport.config.authorization;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
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
        IdentityAttributes id = _supplier.get();
        return id != null && _admins.contains(id.getUsername());
    }

    public boolean userHasPermission(UserPermission permission) {
        Optional<OrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
        return orgRoles.isPresent() && orgRoles.get().getGrantedPermissions().contains(permission);
    }

    public boolean userIsInSameOrg(UUID userId) {
        Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
        String otherUserEmail = getUser(userId).getLoginEmail();
        Optional<Organization> otherOrg = _oktaRepo.getOrganizationRoleClaimsForUser(otherUserEmail)
                .map(r -> _orgService.getOrganization(r.getOrganizationExternalId()));
        return currentOrgRoles.isPresent() && otherOrg.isPresent() 
                ? currentOrgRoles.get().getOrganization().getExternalId().equals(otherOrg.get().getExternalId())
                : false;
    }

    // This replicates getUser() in ApiUserService.java, but we cannot call that logic directly or else that method
    // would have to either a) become public with no method-level security, which is bad; or b) become public with
    // method-level security that invokes an above method which creates a circular loop with this method.
    private ApiUser getUser(UUID id) {
        Optional<ApiUser> found = _userRepo.findById(id);
        if (!found.isPresent()) {
            throw new IllegalGraphqlArgumentException("Cannot find user.");
        }
        ApiUser user = found.get();
        return user;
    }
}
