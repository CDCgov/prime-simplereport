package gov.cdc.usds.simplereport.db.repository;

import java.util.Optional;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;

public interface FacilityRepository extends AuditedEntityRepository<Facility> {

	public Optional<Facility> findByOrganizationAndFacilityName(Organization org, String facilityName);

	public Optional<Facility> findFirstByOrganizationOrderByCreatedAt(Organization org);
}
