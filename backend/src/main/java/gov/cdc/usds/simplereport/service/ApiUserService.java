package gov.cdc.usds.simplereport.service;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;

@Service
@Transactional
public class ApiUserService {

	private PersonRepository _personRepo;
	private ApiUserRepository _apiUserRepo;
	private OrganizationService _orgService;

	public static final String FAKE_USER_EMAIL = "bob@example.com";
	
	public ApiUserService(PersonRepository personRepo, ApiUserRepository apiUserRepo, OrganizationService orgService) {
		_personRepo = personRepo;
		_apiUserRepo = apiUserRepo;
		_orgService = orgService;
	}

	public ApiUser getCurrentUser() {
		Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(FAKE_USER_EMAIL);
		if (found.isPresent()) {
			ApiUser user = found.get();
			user.updateLastSeen();
			return _apiUserRepo.save(user);
		} else {
			Organization org = _orgService.getCurrentOrganization();
			Person authPerson = _personRepo.save(new Person("Bobbity", "Bob", "Bobberoo", null, org));
			return _apiUserRepo.save(new ApiUser(FAKE_USER_EMAIL, authPerson));
		}
	}
	
}
