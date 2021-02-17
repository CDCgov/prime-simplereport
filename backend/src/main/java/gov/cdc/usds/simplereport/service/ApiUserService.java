package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
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
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
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
    public ApiUser createUser(String username, String firstName, String middleName, String lastName, String suffix, String organizationExternalId) {
        return createUserHelper(username, firstName, middleName, lastName, suffix, organizationExternalId);
    }

    @AuthorizationConfiguration.RequirePermissionManageUsers
    public ApiUser createUserInCurrentOrg(String username, String firstName, String middleName, String lastName, String suffix) {
        String organizationExternalId = _orgService.getCurrentOrganization().getExternalId();
        return createUserHelper(username, firstName, middleName, lastName, suffix, organizationExternalId);
    }

    @Transactional
    private ApiUser createUserHelper(String username, String firstName, String middleName, String lastName, String suffix, String organizationExternalId) {
        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        ApiUser user = _apiUserRepo.save(new ApiUser(username, userIdentity));
        Organization org = _orgService.getOrganization(organizationExternalId);
        _oktaRepo.createUser(userIdentity, org);

        LOG.info("User with id={} created by user with id={}", 
                user.getInternalId(),
                getCurrentUserReadOnly().get().getInternalId());

        return user;
    }

    @Transactional
    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public ApiUser updateUser(UUID userId, 
                              String username, 
                              String firstName, 
                              String middleName, 
                              String lastName, 
                              String suffix) {
        ApiUser user = getUser(userId);
        String oldUsername = user.getLoginEmail();

        user.setLoginEmail(username);
        PersonName nameInfo = user.getNameInfo();
        nameInfo.setFirstName(firstName);
        nameInfo.setMiddleName(middleName);
        nameInfo.setLastName(lastName);
        nameInfo.setSuffix(suffix);
        user = _apiUserRepo.save(user);

        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        _oktaRepo.updateUser(oldUsername, userIdentity);

        LOG.info("User with id={} updated by user with id={}", 
                user.getInternalId(),
                getCurrentUserReadOnly().get().getInternalId());

        return user;
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public OrganizationRole updateUserRole(UUID userId, OrganizationRole role) {
        ApiUser user = getUser(userId);
        String username = user.getLoginEmail();
        return _oktaRepo.updateUserRole(username, role);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    @Transactional
    public ApiUser setIsDeleted(UUID userId, boolean deleted) {
        ApiUser user = getUser(userId);
        user.setIsDeleted(deleted);
        _oktaRepo.setUserIsActive(user.getLoginEmail(), !deleted);
        return _apiUserRepo.save(user);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private ApiUser getUser(UUID id) {
        Optional<ApiUser> found = _apiUserRepo.findById(id);
        if (!found.isPresent()) {
            throw new NonexistentUserException();
        }
        ApiUser user = found.get();
        return user;
    }

    @AuthorizationConfiguration.RequirePermissionManageUsers
    public List<ApiUser> getUsersInCurrentOrg(OrganizationRole role) {
        List<String> usernames = _oktaRepo.getAllUsernamesForOrganization(_orgService.getCurrentOrganization(), role);
        return _apiUserRepo.findAllByLoginEmailIn(usernames);
    }

    @AuthorizationConfiguration.RequirePermissionManageUsers
    public List<String> getUsernamesInCurrentOrg(OrganizationRole role) {
        return _oktaRepo.getAllUsernamesForOrganization(_orgService.getCurrentOrganization(), role);
    }

    @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
    public Optional<OrganizationRoles> getOrganizationRolesForUser(UUID userId) {
        ApiUser user = getUser(userId);
        Optional<OrganizationRoleClaims> roleClaims = 
                _oktaRepo.getOrganizationRoleClaimsForUser(user.getLoginEmail());
        return roleClaims.map(c ->
                new OrganizationRoles(_orgService.getOrganization(c.getOrganizationExternalId()),
                                      c.getGrantedRoles()));
    }

    public Boolean isAdmin(ApiUser user) {
        return _siteAdmins.contains(user.getLoginEmail());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<ApiUser> getCurrentUserReadOnly() {
        IdentityAttributes userIdentity = _supplier.get();
        Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(userIdentity.getUsername());
        return found;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ApiUser getCurrentUser() {
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
}