package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Optional;

public interface PatientPreferencesRepository extends AuditedEntityRepository<PatientPreferences> {
  Optional<PatientPreferences> findByPerson(Person person);
}
