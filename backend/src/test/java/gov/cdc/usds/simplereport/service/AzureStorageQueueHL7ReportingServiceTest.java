package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createMultiplexTestEventWithDate;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.hl7v2.HapiContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;
import reactor.core.publisher.MonoSink;

@SpringBootTest
@ActiveProfiles("test")
class AzureStorageQueueHL7ReportingServiceTest {
  @Autowired private GitProperties gitProperties;
  @Autowired private HL7Converter hl7Converter;
  @MockitoSpyBean private HapiContext hapiContext;
  @MockitoBean private QueueAsyncClient queueClient;

  @Test
  void reportAsync_valid() {
    AzureStorageQueueHL7ReportingService service =
        new AzureStorageQueueHL7ReportingService(
            hapiContext, queueClient, gitProperties, hl7Converter);

    Date dateTested = Date.from(LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC));
    TestEvent testEvent = createMultiplexTestEventWithDate(dateTested);

    TestOrder testOrder = testEvent.getTestOrder();
    var testOrderId = UUID.randomUUID();
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    testOrder.setLatestTestEventRef(testEvent);

    when(queueClient.sendMessage(anyString())).thenReturn(Mono.create(MonoSink::success));

    service.reportAsync(testEvent);

    verify(hapiContext, times(1)).getPipeParser();
    verify(queueClient, times(1)).sendMessage(anyString());
  }
}
