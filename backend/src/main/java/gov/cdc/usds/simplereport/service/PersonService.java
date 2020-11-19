package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class PersonService {
    private OrganizationService _os;
    private PersonRepository _repo;

    public PersonService(OrganizationService os, PersonRepository repo) {
        _os = os;
        _repo = repo;
    }

    public List<Person> getPatients() {
        return _repo.findAllByOrganization(_os.getCurrentOrganization());
    }

    public List<Person> getPatient(String id) {
        return _repo.findByIDAndOrganization(id, _os.getCurrentOrganization());
    }
}
