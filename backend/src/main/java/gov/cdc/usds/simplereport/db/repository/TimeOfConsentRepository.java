package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TimeOfConsent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface TimeOfConsentRepository extends CrudRepository<TimeOfConsent, UUID> {
  List<TimeOfConsent> findAllByPatientLink(PatientLink pl);
}
