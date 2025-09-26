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
  List<PatientAnswers> findAllByInternalIdIn(Collection<UUID> internalId);

  @Modifying
  @Query(
      "UPDATE PatientAnswers pa "
          + "SET pa.askOnEntry = null "
          + "WHERE pa.updatedAt <= :cutoffDate")
  void archivePatientAnswersLastUpdatedBefore(@Param("cutoffDate") Date cutoffDate);
}
