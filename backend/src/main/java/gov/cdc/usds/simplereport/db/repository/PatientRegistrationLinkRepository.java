package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import java.util.Optional;

public interface PatientRegistrationLinkRepository
    extends EternalAuditedEntityRepository<PatientSelfRegistrationLink> {

  public Optional<PatientSelfRegistrationLink> findByPatientRegistrationLink(
      String patientRegistrationLink);

  public Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkAndIsDeleted(
      String patientRegistrationLink, Boolean isDeleted);

  public Optional<PatientSelfRegistrationLink> findByOrganization(Organization org);
}
