package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class PatientService {
    private OrganizationService _os;
    private PatientRepository _repo;

    public PatientService(OrganizationService os, PatientRepository repo) {
        _os = os;
        _repo = repo;
    }

    public List<Person> getPatients() {
        return _repo.findAllByOrganization(_os.getCurrentOrganization());
    }
}
