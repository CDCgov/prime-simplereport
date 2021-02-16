package gov.cdc.usds.simplereport.config.authorization;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.CurrentOrganizationRoles;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Authorization translation bean: looks at the current user and tells you what
 * things they can do.
 */
@Component(AuthorizationConfiguration.AUTHORIZER_BEAN)
public class UserAuthorizationVerifier {
    private static final Logger LOG = LoggerFactory.getLogger(AuthorizationConfiguration.class);

    private AdminEmailList _admins;
    private IdentitySupplier _supplier;
    private OrganizationService _orgService;

    public UserAuthorizationVerifier(AdminEmailList admins, IdentitySupplier supplier, OrganizationService orgService) {
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
        Optional<CurrentOrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
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
}
