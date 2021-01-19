package gov.cdc.usds.simplereport.config.authorization;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

public class UserAuthorizationVerifier {

    private AdminEmailList _admins;
    private OrganizationExtractor _extractor;
    private IdentitySupplier _supplier;

    public UserAuthorizationVerifier(AdminEmailList admins, OrganizationExtractor extractor,
            IdentitySupplier supplier) {
        super();
        this._admins = admins;
        this._extractor = extractor;
        this._supplier = supplier;
    }

    public boolean userHasSiteAdminRole() {
        IdentityAttributes id = _supplier.get();
        return id != null && _admins.contains(id.getUsername());
    }

    public boolean userHasOrgAdminRole() {
        // FIXME this is likely correct in like 99% of cases and the other 1% are
        // probably caught by something else. Probably.
        Authentication userAuth = SecurityContextHolder.getContext().getAuthentication();
        List<OrganizationRoles> roles = _extractor.convert(userAuth.getAuthorities());
        return roles.size() == 1 && roles.get(0).getGrantedRoles().contains(OrganizationRole.ADMIN);
    }
}
