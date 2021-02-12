package gov.cdc.usds.simplereport.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

@Service
@Transactional(readOnly = false)
public class ApiUserService {

    private SiteAdminEmailList _siteAdmins;
    private ApiUserRepository _apiUserRepo;
    private IdentitySupplier _supplier;
    private OktaService _oktaService;

    private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);
    
    public ApiUserService(
        ApiUserRepository apiUserRepo,
        IdentitySupplier supplier,
        SiteAdminEmailList admins,
        OktaService oktaService
    ) {
        _apiUserRepo = apiUserRepo;
        _supplier = supplier;
        _siteAdmins = admins;
        _oktaService = oktaService;
    }

    @Transactional
    @AuthorizationConfiguration.RequireGlobalAdminUser
    public ApiUser createUser(String username, String firstName, String middleName, String lastName, String suffix, String organizationExternalId) {
        IdentityAttributes userIdentity = new IdentityAttributes(username, firstName, middleName, lastName, suffix);
        ApiUser user = _apiUserRepo.save(new ApiUser(username, userIdentity));
        _oktaService.createUser(userIdentity, organizationExternalId);
        return user;
    }

    @Transactional
    @AuthorizationConfiguration.RequireGlobalAdminUser
    public ApiUser updateUser(String newUsername, String oldUsername, String firstName, String middleName, String lastName, String suffix) {
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
            LOG.debug("User has logged in before: retrieving user record.");
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