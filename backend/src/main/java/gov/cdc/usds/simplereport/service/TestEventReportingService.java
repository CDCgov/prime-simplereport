package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

/** A service that dispatches TestEvents to the appropriate reporting vehicle. */
public interface TestEventReportingService {
  /**
   * Dispatch the supplied {@link TestEvent} to the appropriate reporting vehicle. This method is
   * expected to interact with external services and is therefore asynchronous; a synchronous
   * wrapper is available in {@link #report(TestEvent)}.
   *
   * @param testEvent The test event to report
   * @return A future that resolves to null if the event was successfully delivered to the reporting
   *     vehicle. If delivery was not successful, the future will complete exceptionally.
   */
  CompletableFuture<Void> reportAsync(TestEvent testEvent);

  /**
   * Like {@link #reportAsync(TestEvent)} but synchronous.
   *
   * @throws RuntimeException if the event was not successfully delivered to the reporting vehicle.
   */
  default void report(TestEvent testEvent) {
    try {
      reportAsync(testEvent).join();
    } catch (CompletionException e) {
      var cause = e.getCause();
      if (cause instanceof RuntimeException) {
        throw (RuntimeException) cause;
      }

      throw e;
    }
  }

  /**
   * Designate the supplied test events as having already been reported. Used primarily to prevent
   * double reporting when both the queue-based system and the cronjob-based system are in use.
   *
   * @param testEvents The {@link TestEvent}s to mark as already reported.
   */
  void markTestEventsAsReported(Set<TestEvent> testEvents);
}
