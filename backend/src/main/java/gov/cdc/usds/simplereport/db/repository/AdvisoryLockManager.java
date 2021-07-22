package gov.cdc.usds.simplereport.db.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;

import javax.persistence.NamedNativeQuery;
import java.util.UUID;

/** A mix-in repository for entity repositories that manage processes that use advisory locks. */
public interface AdvisoryLockManager {

  /**
   * The "scope" constant that defines the category of all postgresql advisory locks this
   * application should obtain. To be used as the first argument to postgresql two-argument lock
   * functions.
   */
  int CORE_API_LOCK_SCOPE = 110506458; // some arbitrary 32-bit number that defines "our" locks
  int TEST_ORDER_LOCK_SCOPE = 895417283; // another arbitrary number - this one specific to TestOrder

  /**
   * Take the advisory lock defined by the two arguments, waiting until the lock is available and
   * releasing it at the end of the current transaction.
   *
   * @param lockCategory the high-level group of locks that contains the lock we are trying to
   *     obtain (in this case, almost always {{@link #CORE_API_LOCK_SCOPE}).
   * @param lock the specific lock we are trying to obtain (usually a constant in the implementing
   *     repository or the service that calls it).
   */
  @Query(
      nativeQuery = true,
      // can't tell hibernate that Types.OTHER is a "void" result in this case:
      // just cast it to text
      value = "select cast(pg_advisory_xact_lock(:lockCategory, :lock) as text)")
  public void waitForTransactionLock(int lockCategory, int lock);

  /**
   * Attempt to take the advisory lock defined by the two arguments. If the lock is available,
   * return {@code true} and retain the lock until the end of the current transaction. If the lock
   * is not available, return {@code false} immediately.
   *
   * @param lockCategory the high-level group of locks that contains the lock we are trying to
   *     obtain (in this case, almost always {{@link #CORE_API_LOCK_SCOPE}).
   * @param lock the specific lock we are trying to obtain (usually a constant in the implementing
   *     repository or the service that calls it).
   * @return true if the lock was obtained, false otherwise
   */
  @Procedure("pg_try_advisory_xact_lock")
  public boolean tryTransactionLock(int lockCategory, int lock);

  @Procedure("pg_try_advisory_lock")
  boolean tryLock(int lockCategory, int lock);

  @Procedure("pg_advisory_unlock")
  boolean unlock(int lockCategory, int lock);
}
