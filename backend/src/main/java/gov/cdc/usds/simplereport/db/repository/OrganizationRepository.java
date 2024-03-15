package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

/** Interface specification for fetching and manipulating {@link Organization} entities */
public interface OrganizationRepository extends EternalAuditedEntityRepository<Organization> {

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.externalId = :externalId")
  Optional<Organization> findByExternalId(String externalId);

  @Query(EternalAuditedEntityRepository.BASE_ALLOW_DELETED_QUERY + " e.externalId = :externalId")
  Optional<Organization> findByExternalIdIncludingDeleted(String externalId);

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.externalId in (:externalIds)")
  List<Organization> findAllByExternalId(Collection<String> externalIds);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + " and e.identityVerified = :identityVerified order by e.organizationName ASC")
  List<Organization> findAllByIdentityVerified(boolean identityVerified);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY + " and UPPER(e.organizationName) = UPPER(:name)")
  List<Organization> findAllByName(String name);

  @Query(
      EternalAuditedEntityRepository.BASE_ALLOW_DELETED_QUERY
          + " UPPER(e.organizationName) = UPPER(:name) and e.isDeleted = :isDeleted")
  List<Organization> findAllByNameAndDeleted(String name, Boolean isDeleted);

  @Query(
      value =
          "from #{#entityName} o"
              + " LEFT JOIN TestEvent te ON te.organization.internalId = o.internalId"
              + " LEFT JOIN Person p ON p.internalId = te.patient.internalId"
              + " WHERE lower(p.address.state) = lower(:state) AND lower(o.externalId) NOT LIKE lower(concat('%', :state,'%'))"
              + " GROUP BY o.internalId")
  List<Organization> findAllByPatientStateWithTestEvents(String state);
}
