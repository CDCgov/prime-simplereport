package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createCovidTestEvent;
import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createMultiplexTestEvent;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;
import reactor.core.publisher.MonoSink;

@SpringBootTest
class AzureStorageQueueFhirReportingServiceTest {
  @Autowired GitProperties gitProperties;
  @Autowired FhirConverter fhirConverter;

  @Test
  void reportAsync_NonCovidOnly() {
    var context = spy(FhirContext.class);
    var client = mock(QueueAsyncClient.class);
    AzureStorageQueueFhirReportingService service =
        new AzureStorageQueueFhirReportingService(context, client, gitProperties, fhirConverter);

    var multiplexTestEvent = createMultiplexTestEvent();
    ReflectionTestUtils.setField(multiplexTestEvent, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(multiplexTestEvent.getPatient(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getPatient(),
        "phoneNumbers",
        List.of(new PhoneNumber(PhoneType.LANDLINE, "7735551234")));
    ReflectionTestUtils.setField(
        multiplexTestEvent.getProviderData(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(multiplexTestEvent.getFacility(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getSpecimenType(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getDeviceType(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getTestOrder(), "internalId", UUID.randomUUID());
    multiplexTestEvent
        .getResults()
        .forEach(result -> ReflectionTestUtils.setField(result, "internalId", UUID.randomUUID()));

    when(client.sendMessage(anyString())).thenReturn(Mono.create(MonoSink::success));
    service.reportAsync(multiplexTestEvent);
    verify(context, times(1)).newJsonParser();
    verify(client, times(1)).sendMessage(anyString());
  }

  @Test
  void reportAsync_CovidOnly() {
    var context = spy(FhirContext.class);
    var client = mock(QueueAsyncClient.class);
    AzureStorageQueueFhirReportingService service =
        new AzureStorageQueueFhirReportingService(context, client, null, fhirConverter);

    var multiplexTestEvent = createCovidTestEvent();
    ReflectionTestUtils.setField(multiplexTestEvent.getPatient(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getPatient(),
        "phoneNumbers",
        List.of(new PhoneNumber(PhoneType.LANDLINE, "7735551234")));
    ReflectionTestUtils.setField(
        multiplexTestEvent.getProviderData(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(multiplexTestEvent.getFacility(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getSpecimenType(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getDeviceType(), "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        multiplexTestEvent.getTestOrder(), "internalId", UUID.randomUUID());
    multiplexTestEvent
        .getResults()
        .forEach(result -> ReflectionTestUtils.setField(result, "internalId", UUID.randomUUID()));

    service.reportAsync(multiplexTestEvent);
    verify(context, times(0)).newJsonParser();
    verify(client, times(0)).sendMessage(anyString());
  }
}
