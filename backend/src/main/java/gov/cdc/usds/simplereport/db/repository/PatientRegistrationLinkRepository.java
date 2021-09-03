package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientRegistrationLinkRepository
    extends EternalAuditedEntityRepository<PatientSelfRegistrationLink> {

  Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkIgnoreCase(
      String patientRegistrationLink);

  List<PatientSelfRegistrationLink> findAllByOrganizationInternalIdIn(Collection<UUID> orgIds);

  List<PatientSelfRegistrationLink> findAllByFacilityInternalIdIn(Collection<UUID> facilityIds);

  Optional<PatientSelfRegistrationLink> findByPatientRegistrationLinkIgnoreCaseAndIsDeleted(
      String patientRegistrationLink, Boolean isDeleted);

  Optional<PatientSelfRegistrationLink> findByOrganization(Organization org);

  Optional<PatientSelfRegistrationLink> findByFacility(Facility fac);
}
