package gov.cdc.usds.simplereport.service;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;

@Service
@Transactional
public class ApiUserService {

	private ApiUserRepository _apiUserRepo;

	public static final String FAKE_USER_EMAIL = "bob@example.com";
	public static final PersonName FAKE_USER = new PersonName("Bobbity", "Bob", "Bobberoo", null);
	
	public ApiUserService(ApiUserRepository apiUserRepo) {
		_apiUserRepo = apiUserRepo;
	}

	public ApiUser getCurrentUser() {
		Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(FAKE_USER_EMAIL);
		if (found.isPresent()) {
			ApiUser user = found.get();
			user.updateLastSeen();
			return _apiUserRepo.save(user);
		} else {
			return _apiUserRepo.save(new ApiUser(FAKE_USER_EMAIL, FAKE_USER));
		}
	}
	
}
