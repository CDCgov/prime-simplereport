package gov.cdc.usds.simplereport.config.authorization;

import java.util.Optional;

import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.CurrentOrganizationRoles;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

public class UserAuthorizationVerifier {

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

    public boolean userHasOrgAdminRole() {
        Optional<CurrentOrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
        return orgRoles.isPresent() && orgRoles.get().getGrantedRoles().contains(OrganizationRole.ADMIN);
    }
}
