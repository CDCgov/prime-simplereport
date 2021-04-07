package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import java.util.Optional;
import java.util.UUID;

public interface PatientPreferencesRepository extends AuditedEntityRepository<PatientPreferences> {
  Optional<PatientPreferences> findByPersonInternalId(UUID personId);
}
