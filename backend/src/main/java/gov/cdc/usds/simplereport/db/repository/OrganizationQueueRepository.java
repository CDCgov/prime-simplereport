package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface OrganizationQueueRepository
    extends EternalAuditedEntityRepository<OrganizationQueueItem>, AdvisoryLockManager {

  int ORG_QUEUE_REMINDER_LOCK = 66543221; // arbitrary 32-bit integer for our lock

  @Query(EternalAuditedEntityRepository.BASE_QUERY + " and e.verifiedOrganization IS NULL")
  List<OrganizationQueueItem> findAllNotIdentityVerified();

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + " and e.verifiedOrganization IS NULL and e.createdAt > :rangeStartDate and e.createdAt <= :rangeStopDate")
  List<OrganizationQueueItem> findAllNotIdentityVerifiedByCreatedAtRange(
      Date rangeStartDate, Date rangeStopDate);

  @Query(
      EternalAuditedEntityRepository.BASE_QUERY
          + " and e.verifiedOrganization IS NULL and e.externalId = :orgExternalId")
  Optional<OrganizationQueueItem> findUnverifiedByExternalId(String orgExternalId);

  /**
   * Try to obtain the lock for the unverified organization reminders task. (It will be released
   * automatically when the current transaction closes.)
   *
   * @return true if the lock was obtained, false otherwise.
   */
  default boolean tryOrgReminderLock() {
    return tryTransactionLock(CORE_API_LOCK_SCOPE, ORG_QUEUE_REMINDER_LOCK);
  }
}
