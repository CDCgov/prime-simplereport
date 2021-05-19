package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import java.util.Optional;

public interface PatientRegistrationLinkRepository
    extends EternalAuditedEntityRepository<PatientSelfRegistrationLink> {

  public Optional<PatientSelfRegistrationLink> findByPatientRegistrationLink(
      String patientRegistrationLink);
}
