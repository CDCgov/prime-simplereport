package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientPreferencesRepository extends AuditedEntityRepository<PatientPreferences> {
  Optional<PatientPreferences> findByPerson(Person person);

  List<PatientPreferences> findAllByPersonInternalIdIn(Collection<UUID> personIds);
}
