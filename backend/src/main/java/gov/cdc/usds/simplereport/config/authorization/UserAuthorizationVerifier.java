package gov.cdc.usds.simplereport.config.authorization;

import java.util.Optional;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
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

    public UserAuthorizationVerifier(SiteAdminEmailList admins, IdentitySupplier supplier, OrganizationService orgService) {
        super();
        this._admins = admins;
        this._supplier = supplier;
        this._orgService = orgService;
    }

    public boolean userHasSiteAdminRole() {
        IdentityAttributes id = _supplier.get();
        return id != null && _admins.contains(id.getUsername());
    }

    public boolean userHasPermission(UserPermission permission) {
        Optional<OrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
        return orgRoles.isPresent() && orgRoles.get().getGrantedPermissions().contains(permission);
    }

    public boolean userIsInOrg(String organizationExternalId) {
        Optional<OrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
        return orgRoles.isPresent() ? orgRoles.get().getOrganization().getExternalId() == organizationExternalId
                                    : false;
    }
}
