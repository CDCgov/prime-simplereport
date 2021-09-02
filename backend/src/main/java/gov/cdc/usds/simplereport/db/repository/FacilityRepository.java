package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

public interface FacilityRepository extends EternalAuditedEntityRepository<Facility> {

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.organization = :org")
  Set<Facility> findAllByOrganization(Organization org);

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.organization = :org and e.id = :id")
  Optional<Facility> findByOrganizationAndInternalId(Organization org, UUID id);

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.organization = :org and e.id in :ids")
  Set<Facility> findAllByOrganizationAndInternalId(Organization org, Collection<UUID> ids);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + " and e.organization = :org and e.facilityName = :facilityName")
  Optional<Facility> findByOrganizationAndFacilityName(Organization org, String facilityName);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + " and e.organization = :org order by e.facilityName")
  List<Facility> findByOrganizationOrderByFacilityName(Organization org);
}
