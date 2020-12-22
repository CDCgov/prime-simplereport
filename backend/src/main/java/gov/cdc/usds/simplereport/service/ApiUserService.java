package gov.cdc.usds.simplereport.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

@Service
@Transactional
public class ApiUserService {
    private AdminEmailList _admins;
    private ApiUserRepository _apiUserRepo;
    private IdentitySupplier _supplier;

    private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);
    
    public ApiUserService(
        ApiUserRepository apiUserRepo,
        IdentitySupplier supplier,
        AdminEmailList admins
    ) {
        _apiUserRepo = apiUserRepo;
        _supplier = supplier;
        _admins = admins;
    }

    public void isAdminUser() {
        IdentityAttributes userIdentity = _supplier.get();
        if (!_admins.contains(userIdentity.getUsername())) {
            throw new IllegalGraphqlArgumentException("Current User does not have permission for this action");
        }
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
            LOG.info("Initial login for {}: creating user record.", userIdentity.getUsername());
            return _apiUserRepo.save(new ApiUser(userIdentity.getUsername(), userIdentity));
        }
    }
}
