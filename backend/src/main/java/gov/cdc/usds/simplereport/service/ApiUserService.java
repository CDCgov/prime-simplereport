package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.UserAuthorizationVerifier;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.OrganizationService;

@Service
@Transactional(readOnly = false)
public class ApiUserService {

    private SiteAdminEmailList _siteAdmins;
    private ApiUserRepository _apiUserRepo;
    private IdentitySupplier _supplier;
    private OrganizationService _orgService;
    private OktaService _oktaService;

    private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);
    
    public ApiUserService(
        ApiUserRepository apiUserRepo,
        IdentitySupplier supplier,
        SiteAdminEmailList admins,
        OrganizationService orgService,
        OktaService oktaService
    ) {
        _apiUserRepo = apiUserRepo;
        _supplier = supplier;
        _siteAdmins = admins;
        _orgService = orgService;
        _oktaService = oktaService;
    }

    @Transactional
    public ApiUser createUser(String username, String firstName, String middleName, String lastName, String suffix, String organizationExternalId) {
        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        ApiUser user = _apiUserRepo.save(new ApiUser(username, userIdentity));
        _oktaService.createUser(userIdentity, organizationExternalId);
        return user;
    }

    @AuthorizationConfiguration.RequirePermissionManageUserList
    public ApiUser createUserInCurrentOrg(String username, String firstName, String middleName, String lastName, String suffix) {
        String organizationExternalId = _orgService.getCurrentOrganization().getExternalId();
        return createUser(username, firstName, middleName, lastName, suffix, organizationExternalId);
    }

    @Transactional
    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageUserListForOrg
    public ApiUser updateUser(String newUsername, 
                              String oldUsername, 
                              String firstName, 
                              String middleName, 
                              String lastName, 
                              String suffix, 
                              String organizationExternalId) {
        Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(oldUsername);
        if (!found.isPresent()) {
            throw new IllegalGraphqlArgumentException("Cannot update User whose email does not exist");
        }
        ApiUser user = found.get();
        user.setLoginEmail(newUsername);
        PersonName nameInfo = user.getNameInfo();
        nameInfo.setFirstName(firstName);
        nameInfo.setMiddleName(middleName);
        nameInfo.setLastName(lastName);
        nameInfo.setSuffix(suffix);
        user = _apiUserRepo.save(user);
        IdentityAttributes userIdentity = new IdentityAttributes(newUsername, firstName, middleName, lastName, suffix);
        if (!newUsername.equals(oldUsername)) {
            _oktaService.updateUser(oldUsername, userIdentity);
        }
        return user;
    }

    @Transactional
    public ApiUser updateUser(String newUsername, String oldUsername, String firstName, String middleName, String lastName, String suffix) {
        Optional<Organization> org = 
                _oktaService.getOrganizationRoleClaimsForUser(oldUsername)
                            .map(c -> _orgService.getOrganization(c.getOrganizationExternalId()));
        String orgExternalId = org.isPresent() ? org.get().getExternalId() : null;
        return updateUser(newUsername, oldUsername, firstName, middleName, lastName, suffix, orgExternalId);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageUserListForOrg
    private void updateUserRole(String username, String organizationExternalId, OrganizationRole role) {
        _oktaService.updateUserRole(username, role);
    }

    public void updateUserRole(String username, OrganizationRole role) {
        OrganizationRoleClaims claims = _oktaService.getOrganizationRoleClaimsForUser(username)
                .orElseThrow(()->new IllegalGraphqlArgumentException("Cannot update role for user who is not in an organization"));
        Organization org = _orgService.getOrganization(claims.getOrganizationExternalId());
        updateUserRole(username, org.getExternalId(), role);
    }

    @AuthorizationConfiguration.RequirePermissionManageUserList
    public List<ApiUser> getUsersInCurrentOrg(OrganizationRole role) {
        String organizationExternalId = _orgService.getCurrentOrganization().getExternalId();
        List<String> usernames = _oktaService.getAllUsernamesForOrganization(organizationExternalId, role);
        return _apiUserRepo.findAllByUsername(usernames);
    }

    @AuthorizationConfiguration.RequirePermissionManageUserList
    public List<String> getUsernamesInCurrentOrg(OrganizationRole role) {
        String organizationExternalId = _orgService.getCurrentOrganization().getExternalId();
        return _oktaService.getAllUsernamesForOrganization(organizationExternalId, role);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageUserListForOrg
    public Optional<OrganizationRoles> getOrganizationRolesForUser(ApiUser apiUser, String organizationExternalId) {
        Optional<OrganizationRoleClaims> roleClaims = 
                _oktaService.getOrganizationRoleClaimsForUser(apiUser.getLoginEmail());
        return roleClaims.map(c -> {
            return new OrganizationRoles(_orgService.getOrganization(c.getOrganizationExternalId()),
                                         c.getGrantedRoles());
        });
    }

    public Optional<OrganizationRoles> getOrganizationRolesForUser(ApiUser apiUser) {
        OrganizationRoleClaims roleClaims = _oktaService.getOrganizationRoleClaimsForUser(apiUser.getLoginEmail())
                .orElseThrow(()->new IllegalGraphqlArgumentException("Cannot get roles for user who is not in an organization"));
        Organization org = _orgService.getOrganization(roleClaims.getOrganizationExternalId());
        return getOrganizationRolesForUser(apiUser, org.getExternalId());
    }

    public Boolean isAdmin(ApiUser user) {
        return _siteAdmins.contains(user.getLoginEmail());
    }

    public void assertEmailAvailable(String email) {
        _apiUserRepo.findByLoginEmail(email)
            .ifPresent(f->{throw new IllegalGraphqlArgumentException("A User with that email already exists");})
        ;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ApiUser getCurrentUser() {
        IdentityAttributes userIdentity = _supplier.get();
        Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(userIdentity.getUsername());
        if (found.isPresent()) {
            LOG.info("User has logged in before: retrieving user record.");
            ApiUser user = found.get();
            user.updateLastSeen();
            return _apiUserRepo.save(user);
        } else {
            // Assumes user already has a corresponding Okta entity; otherwise, they couldn't log in :)
            LOG.info("Initial login for user: creating user record.");
            ApiUser user = new ApiUser(userIdentity.getUsername(), userIdentity);
            user.updateLastSeen();
            return _apiUserRepo.save(user);
        }
    }
}