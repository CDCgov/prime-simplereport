package gov.cdc.usds.simplereport.db.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import gov.cdc.usds.simplereport.db.model.TimeOfConsent;
import gov.cdc.usds.simplereport.db.model.PatientLink;

public interface TimeOfConsentRepository extends CrudRepository<TimeOfConsent, UUID> {

    public List<TimeOfConsent> findAllByPatientLink(PatientLink pl);
}
