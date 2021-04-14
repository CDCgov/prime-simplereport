package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

public interface PatientPreferencesRepository extends AuditedEntityRepository<PatientPreferences> {
  Optional<PatientPreferences> findByPerson(Person person);

  @Query(
      value =
          "SELECT person.internal_id,"
              + " COALESCE(patient_preferences.preferred_language, null) preferred_language, COALESCE(patient_preferences.test_result_delivery, 'NONE') test_result_delivery,"
              + " patient_preferences.created_at, patient_preferences.created_by, patient_preferences.updated_at, patient_preferences.updated_by"
              + " FROM {h-schema}patient_preferences"
              + " RIGHT JOIN {h-schema}person ON patient_preferences.internal_id = person.internal_id"
              + " WHERE person.internal_id IN :patientIds",
      nativeQuery = true)
  List<PatientPreferences> findAllAndCoalesceEmptyByPersonInternalIdIn(Collection<UUID> patientIds);
}
