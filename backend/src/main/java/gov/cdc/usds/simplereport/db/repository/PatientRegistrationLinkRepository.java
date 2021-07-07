package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import java.util.Optional;

public interface PatientRegistrationLinkRepository
    extends EternalAuditedEntityRepository<PatientSelfRegistrationLink> {

  public Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkIgnoreCase(
      String patientRegistrationLink);

  public Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkIgnoreCaseAndIsDeleted(
      String patientRegistrationLink, Boolean isDeleted);

  public Optional<PatientSelfRegistrationLink> findByOrganization(Organization org);

  public Optional<PatientSelfRegistrationLink> findByFacility(Facility fac);
}
