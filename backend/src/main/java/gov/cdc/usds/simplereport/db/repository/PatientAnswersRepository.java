package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientAnswersRepository extends DeletableEntityRepository<PatientAnswers> {

  @Query(
      """
    SELECT pa
    FROM PatientAnswers pa
    WHERE pa.internalId IN :internalIds
      AND (pa.piiDeleted IS NULL OR pa.piiDeleted = FALSE)
  """)
  List<PatientAnswers> findAllByInternalIdIn(@Param("internalIds") Collection<UUID> internalIds);

  @Modifying
  @Query(
      // this query deletes pii from patient_answers
      // where the patient_answers' test_order has no
      // child test_event updated after the cutoffDate
      """
    UPDATE PatientAnswers pa
    SET pa.askOnEntry = null,
        pa.piiDeleted = true
    WHERE pa.updatedAt <= :cutoffDate
      AND NOT EXISTS (
        SELECT 1
        FROM TestEvent te
        WHERE te.order.patientAnswersId = pa.internalId
          AND te.updatedAt > :cutoffDate
      )
    """)
  void deletePiiForPatientAnswers(@Param("cutoffDate") Date cutoffDate);
}
