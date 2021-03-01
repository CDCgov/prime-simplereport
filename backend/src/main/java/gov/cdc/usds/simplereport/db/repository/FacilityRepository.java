package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityRepository extends EternalAuditedEntityRepository<Facility> {

  public Optional<Facility> findByOrganizationAndInternalId(Organization org, UUID id);

  public Optional<Facility> findByOrganizationInternalIdAndInternalId(UUID orgId, UUID id);

  public Optional<Facility> findByOrganizationAndFacilityName(
      Organization org, String facilityName);

  public List<Facility> findByOrganizationOrderByFacilityName(Organization org);
}
