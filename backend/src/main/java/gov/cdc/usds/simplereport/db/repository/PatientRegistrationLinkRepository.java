package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import java.util.Optional;

public interface PatientRegistrationLinkRepository
    extends EternalAuditedEntityRepository<PatientSelfRegistrationLink> {

  Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkIgnoreCase(
      String patientRegistrationLink);

  Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkIgnoreCaseAndIsDeleted(
      String patientRegistrationLink, Boolean isDeleted);

  Optional<PatientSelfRegistrationLink> findByOrganization(Organization org);

  Optional<PatientSelfRegistrationLink> findByFacility(Facility fac);
}
