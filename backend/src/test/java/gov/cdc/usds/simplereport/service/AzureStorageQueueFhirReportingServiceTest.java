package gov.cdc.usds.simplereport.service;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;
import reactor.core.publisher.MonoSink;

class AzureStorageQueueFhirReportingServiceTest {

  @Test
  void reportAsync_success() {
    var context = spy(FhirContext.class);
    var client = mock(QueueAsyncClient.class);
    AzureStorageQueueFhirReportingService service =
        new AzureStorageQueueFhirReportingService(context, client);

    var address = new StreetAddress(List.of("1 Main St"), "Chicago", "IL", "60614", "");
    var deviceType = new DeviceType("name", "manufacturer", "model", "loinc", "nasal", 0);
    var specimenType = new SpecimenType("name", "typeCode");
    var deviceSpecimenType = new DeviceSpecimenType(deviceType, specimenType);
    var provider =
        new Provider(new PersonName("Michaela", null, "Quinn", ""), "1", address, "7735551235");
    var organization = new Organization("District", "school", "1", true);
    var facility =
        new Facility(
            organization,
            "School",
            "1",
            address,
            "7735551234",
            "school@example.com",
            provider,
            deviceSpecimenType,
            Collections.emptyList());
    var person =
        new Person(
            organization,
            null,
            "Tracy",
            null,
            "Jordan",
            null,
            LocalDate.of(2022, 12, 13),
            address,
            "USA",
            PersonRole.STUDENT,
            List.of("tj@example.com"),
            "black",
            "not hispanic",
            Collections.emptyList(),
            "male",
            false,
            false,
            "",
            null);
    var testOrder = new TestOrder(person, facility);
    var testEvent = new TestEvent(testOrder, false, Collections.emptySet());
    ReflectionTestUtils.setField(provider, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(facility, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(person, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(specimenType, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(deviceType, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(testOrder, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(testEvent, "internalId", UUID.randomUUID());
    ReflectionTestUtils.setField(
        person, "phoneNumbers", List.of(new PhoneNumber(PhoneType.LANDLINE, "7735551234")));

    when(client.sendMessage(anyString())).thenReturn(Mono.create(MonoSink::success));
    service.reportAsync(testEvent);
    verify(context, times(1)).newJsonParser();
    verify(client, times(1)).sendMessage(anyString());
  }
}
