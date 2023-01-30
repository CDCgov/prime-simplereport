package gov.cdc.usds.simplereport.db.repository;

import org.springframework.data.jpa.repository.query.Procedure;

/** A mix-in repository for entity repositories that manage processes that use advisory locks. */
public interface AdvisoryLockManager {
  /**
   * The "scope" constant that defines the category of the advisory locks this application should
   * obtain when locking test orders. To be used as the first argument to postgresql two-argument
   * lock functions.
   */
  int TEST_ORDER_LOCK_SCOPE = 895417283;

  @Procedure("pg_try_advisory_lock")
  boolean tryLock(int lockCategory, int lock);

  @Procedure("pg_advisory_unlock")
  boolean unlock(int lockCategory, int lock);
}
