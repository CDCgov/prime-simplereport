package gov.cdc.usds.simplereport.service;

import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.UserPermission;
import gov.cdc.usds.simplereport.config.authorization.AuthorizationPermissions;
import gov.cdc.usds.simplereport.config.authorization.UserType;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.service.OktaService;

@Service
@Transactional(readOnly = false)
public class ApiUserService {

    private AdminEmailList _admins;
    private AuthorizationPermissions _permissions;
    private ApiUserRepository _apiUserRepo;
    private IdentitySupplier _supplier;
    private OktaService _oktaService;

    private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);
    
    public ApiUserService(
        ApiUserRepository apiUserRepo,
        IdentitySupplier supplier,
        AdminEmailList admins,
        AuthorizationPermissions permissions,
        OktaService oktaService
    ) {
        _apiUserRepo = apiUserRepo;
        _supplier = supplier;
        _admins = admins;
        _permissions = permissions;
        _oktaService = oktaService;
    }

    @Transactional
    public ApiUser createUser(String username, String firstName, String middleName, String lastName, String suffix, String organizationExternalId) {
        isAdminUser();
        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        ApiUser user = _apiUserRepo.save(new ApiUser(username, userIdentity));
        _oktaService.createUser(userIdentity, organizationExternalId);
        return user;
    }

    @Transactional
    public ApiUser updateUser(String newUsername, String oldUsername, String firstName, String middleName, String lastName, String suffix) {
        isAdminUser();
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

    public void isAdminUser() {
        IdentityAttributes userIdentity = _supplier.get();
        if (!_admins.contains(userIdentity.getUsername())) {
            throw new IllegalGraphqlArgumentException("Current User does not have permission for this action");
        }
    }

    public Boolean isAdminUser(ApiUser user) {
        return _admins.contains(user.getLoginEmail());
    }

    public UserType getUserType(ApiUser user) {
        // ***TODO: fill in authorization here***
        // ~Magic~
        return UserType.STANDARD;
    }

    public List<UserPermission> getPermissions(ApiUser user) {
        return _permissions.getOrDefault(getUserType(user), new ArrayList<UserPermission>());
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
            ApiUser user = found.get();
            user.updateLastSeen();
            return _apiUserRepo.save(user);
        } else {
            // Assumes user already has a corresponding Okta entity; otherwise, they couldn't log in :)
            LOG.info("Initial login for {}: creating user record.", userIdentity.getUsername());
            ApiUser user = new ApiUser(userIdentity.getUsername(), userIdentity);
            user.updateLastSeen();
            return _apiUserRepo.save(user);
        }
    }
}