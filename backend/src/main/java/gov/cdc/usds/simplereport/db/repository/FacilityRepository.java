package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.DeviceType;
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

  @Query(
      EternalAuditedEntityRepository.BASE_ALLOW_DELETED_QUERY
          + " e.organization = :org and e.isDeleted = :isDeleted")
  Set<Facility> findAllByOrganizationAndDeleted(Organization org, boolean isDeleted);

  @Query(
      EternalAuditedEntityRepository.BASE_ALLOW_DELETED_QUERY
          + " e.organization = :org and e.id = :id")
  Optional<Facility> findByOrganizationAndInternalIdAllowDeleted(Organization org, UUID id);

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.organization = :org and e.id = :id")
  Optional<Facility> findByOrganizationAndInternalId(Organization org, UUID id);

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and organization_id IN (:orgIds)")
  List<Facility> findAllByOrganizationInternalIdIn(Collection<UUID> orgIds);

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

  @Query("from Facility e where :deviceType member of e.configuredDeviceTypes")
  Set<Facility> findByDeviceType(DeviceType deviceType);
}
