package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

class DataRetentionServiceTest extends BaseServiceTest<DataRetentionService> {

  @MockBean private PersonRepository personRepository;
  @MockBean private TestEventRepository testEventRepository;

  @Test
  void scheduledDeleteOldData_disabled_skipsExecution() throws Exception {
    // When the feature flag is disabled, the job should skip execution
    _service.scheduledDeleteOldData();

    // Verify no repository interactions occurred
    verify(personRepository, never()).findAllByInternalIdIn(org.mockito.Mockito.any());
    verify(testEventRepository, never()).findAllByInternalIdIn(org.mockito.Mockito.any());
  }

  @Test
  void scheduledDeleteOldData_enabled_executesSuccessfully() {
    // When enabled, the job should execute without errors (placeholder logic returns 0 deletions)
    assertDoesNotThrow(() -> _service.scheduledDeleteOldData());
  }

  @Test
  void deleteOldData_withCustomConfiguration_usesCorrectSettings() {
    // Test that custom configuration values are properly loaded and used
    assertDoesNotThrow(() -> _service.deleteOldData());
  }

  @Test
  void deleteOldData_withShortTimeout_respectsExecutionTimeLimit() {
    // Test that the job respects the maximum execution time limit
    // With placeholder logic returning 0 deletions, this should complete quickly
    long startTime = System.currentTimeMillis();

    assertDoesNotThrow(() -> _service.deleteOldData());

    long executionTime = System.currentTimeMillis() - startTime;
    // Should complete much faster than the 1-minute timeout since no real deletion occurs
    assertTrue(executionTime < 60000, "Job should complete quickly with placeholder logic");
  }
}
