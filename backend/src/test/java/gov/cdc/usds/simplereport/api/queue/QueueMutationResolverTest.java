package gov.cdc.usds.simplereport.api.queue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.stereotype.Component;

@Component
class QueueMutationResolverTest {
  @Test
  void updateTestTimer() {
    // GIVEN
    TestOrderService testOrderService = mock(TestOrderService.class);
    PersonService personService = mock(PersonService.class);

    long currentTime = System.currentTimeMillis();
    String currentTimeString = Long.toString(currentTime);

    var sut = new QueueMutationResolver(testOrderService, personService);

    // WHEN
    sut.updateTestOrderTimerStartedAt(UUID.randomUUID(), currentTimeString);

    // THEN
    verify(testOrderService).updateTimerStartedAt(any(UUID.class), eq(currentTimeString));
  }
}
