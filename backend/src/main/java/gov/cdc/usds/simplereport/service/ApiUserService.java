package gov.cdc.usds.simplereport.service;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.service.OrganizationService;

@Service
@Transactional(readOnly = false)
public class ApiUserService {

    private SiteAdminEmailList _siteAdmins;
    private ApiUserRepository _apiUserRepo;
    private IdentitySupplier _supplier;
    private OrganizationService _orgService;
    private OktaRepository _oktaRepo;

    private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);
    
    public ApiUserService(
        ApiUserRepository apiUserRepo,
        IdentitySupplier supplier,
        SiteAdminEmailList admins,
        OrganizationService orgService,
        OktaRepository oktaRepo
    ) {
        _apiUserRepo = apiUserRepo;
        _supplier = supplier;
        _siteAdmins = admins;
        _orgService = orgService;
        _oktaRepo = oktaRepo;
    }

    @AuthorizationConfiguration.RequireGlobalAdminUser
    public UserInfo createUser(String username, String firstName, String middleName, String lastName, String suffix, String organizationExternalId) {
        Organization org = _orgService.getOrganization(organizationExternalId);
        return createUserHelper(username, firstName, middleName, lastName, suffix, org);
    }

    @AuthorizationConfiguration.RequirePermissionManageUsers
    public UserInfo createUserInCurrentOrg(String username, String firstName, String middleName, String lastName, String suffix) {
        Organization org = _orgService.getCurrentOrganization();
        return createUserHelper(username, firstName, middleName, lastName, suffix, org);
    }

    private UserInfo createUserHelper(String username, String firstName, String middleName, String lastName, String suffix, Organization org) {
        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        ApiUser apiUser = _apiUserRepo.save(new ApiUser(username, userIdentity));
        Optional<OrganizationRoleClaims> roleClaims = _oktaRepo.createUser(userIdentity, org);
        Optional<OrganizationRoles> orgRoles = roleClaims.map(c ->
                new OrganizationRoles(org, c.getGrantedRoles()));
        boolean isAdmin = isAdmin(apiUser);
        UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

        LOG.info("User with id={} created by user with id={}", 
                 apiUser.getInternalId(), 
                 getCurrentApiUser().getInternalId().toString());

        return user;
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public UserInfo updateUser(UUID userId, 
                              String username, 
                              String firstName, 
                              String middleName, 
                              String lastName, 
                              String suffix) {
        ApiUser apiUser = getApiUser(userId);
        String oldUsername = apiUser.getLoginEmail();

        apiUser.setLoginEmail(username);
        PersonName nameInfo = apiUser.getNameInfo();
        nameInfo.setFirstName(firstName);
        nameInfo.setMiddleName(middleName);
        nameInfo.setLastName(lastName);
        nameInfo.setSuffix(suffix);
        apiUser = _apiUserRepo.save(apiUser);

        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        Optional<OrganizationRoleClaims> roleClaims = _oktaRepo.updateUser(oldUsername, userIdentity);
        Optional<OrganizationRoles> orgRoles = roleClaims.map(c ->
                new OrganizationRoles(_orgService.getOrganization(c.getOrganizationExternalId()), 
                                      c.getGrantedRoles()));
        boolean isAdmin = isAdmin(apiUser);
        UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);
        
        LOG.info("User with id={} updated by user with id={}", 
                 apiUser.getInternalId(), 
                 getCurrentApiUser().getInternalId().toString());

        return user;
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public OrganizationRole updateUserRole(UUID userId, OrganizationRole role) {
        ApiUser user = getApiUser(userId);
        String username = user.getLoginEmail();
        OrganizationRoleClaims orgClaims = _oktaRepo.getOrganizationRoleClaimsForUser(username)
                .orElseThrow(MisconfiguredUserException::new);
        Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
        return _oktaRepo.updateUserRole(username, org, role);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public UserInfo setIsDeleted(UUID userId, boolean deleted) {
        ApiUser apiUser = getApiUser(userId);
        apiUser.setIsDeleted(deleted);
        apiUser = _apiUserRepo.save(apiUser);
        _oktaRepo.setUserIsActive(apiUser.getLoginEmail(), !deleted);
        return new UserInfo(apiUser, Optional.empty(), isAdmin(apiUser));
    }

    private ApiUser getApiUser(UUID id) {
        Optional<ApiUser> found = _apiUserRepo.findById(id);
        if (!found.isPresent()) {
            throw new NonexistentUserException();
        }
        ApiUser user = found.get();
        return user;
    }

    private List<ApiUser> getApiUsersInCurrentOrg(OrganizationRole role) {
        List<String> usernames = _oktaRepo.getAllUsernamesForOrganization(_orgService.getCurrentOrganization(), role);
        return _apiUserRepo.findAllByLoginEmailIn(usernames);
    }

    private List<String> getUsernamesInCurrentOrg(OrganizationRole role) {
        return _oktaRepo.getAllUsernamesForOrganization(_orgService.getCurrentOrganization(), role);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public Optional<OrganizationRoles> getOrganizationRolesForUser(UUID userId) {
        ApiUser user = getApiUser(userId);
        Optional<OrganizationRoleClaims> roleClaims = 
                _oktaRepo.getOrganizationRoleClaimsForUser(user.getLoginEmail());
        return roleClaims.map(c ->
                new OrganizationRoles(_orgService.getOrganization(c.getOrganizationExternalId()),
                                      c.getGrantedRoles()));
    }

    public boolean isAdmin(ApiUser user) {
        return _siteAdmins.contains(user.getLoginEmail());
    }

    // Creating separate getCurrentApiUser() methods because the auditing use case and
    // sample data initialization require contained transactions, while Sonar requires 
    // a non-Transactional version to be called from other methods in the same class
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ApiUser getCurrentApiUserInContainedTransaction() {
        return getCurrentApiUser();
    }

    private ApiUser getCurrentApiUser() {
        IdentityAttributes userIdentity = _supplier.get();
        Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(userIdentity.getUsername());
        if (found.isPresent()) {
            LOG.debug("User has logged in before: retrieving user record.");
            ApiUser user = found.get();
            user.updateLastSeen();
            user = _apiUserRepo.save(user);
            return user;
        } else {
            // Assumes user already has a corresponding Okta entity; otherwise, they couldn't log in :)
            LOG.info("Initial login for user: creating user record.");
            ApiUser user = new ApiUser(userIdentity.getUsername(), userIdentity);
            user.updateLastSeen();
            user = _apiUserRepo.save(user);

            LOG.info("User with id={} self-created", 
                    user.getInternalId());

            return user;
        }
    }

    public UserInfo getCurrentUserInfo() {
        ApiUser currentUser = getCurrentApiUser();
        Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
        boolean isAdmin = isAdmin(currentUser);
        return new UserInfo(currentUser, currentOrgRoles, isAdmin);
    }

    @AuthorizationConfiguration.RequirePermissionManageUsers
    public List<UserInfo> getUsersInCurrentOrg() {
        Organization org = _orgService.getCurrentOrganization();
        List<ApiUser> apiUsers = getApiUsersInCurrentOrg(OrganizationRole.getDefault());
        Set<String> admins = new HashSet<>(getUsernamesInCurrentOrg(OrganizationRole.ADMIN));
        Set<String> entryOnly = new HashSet<>(getUsernamesInCurrentOrg(OrganizationRole.ENTRY_ONLY));
        return apiUsers.stream().map(u -> {
            Set<OrganizationRole> roles = EnumSet.of(OrganizationRole.USER);
            String email = u.getLoginEmail();
            if (admins.contains(email)) {
                roles.add(OrganizationRole.ADMIN);
            }
            if (entryOnly.contains(email)) {
                roles.add(OrganizationRole.ENTRY_ONLY);
            }
            OrganizationRoles orgRoles = new OrganizationRoles(org, roles);
            return new UserInfo(u, Optional.of(orgRoles), isAdmin(u));
        }).collect(Collectors.toList());
    }
}