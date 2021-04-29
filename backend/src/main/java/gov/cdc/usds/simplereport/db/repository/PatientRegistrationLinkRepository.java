package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import java.util.Optional;

public interface PatientRegistrationLinkRepository
    extends EternalAuditedEntityRepository<PatientRegistrationLink> {

  public Optional<PatientRegistrationLink> findByPatientRegistrationLink(
      String patientRegistrationLink);
}
