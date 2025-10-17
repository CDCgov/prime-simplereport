package gov.cdc.usds.simplereport.api.patient;

import gov.cdc.usds.simplereport.api.InternalIdResolver;
import gov.cdc.usds.simplereport.api.PersonNameResolver;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class PatientDataResolver implements PersonNameResolver<Person>, InternalIdResolver<Person> {

  public PatientDataResolver(
      BatchLoaderRegistry registry,
      TestEventRepository testEventRepository,
      PhoneNumberRepository phoneNumberRepository) {
    registry
        .forTypePair(UUID.class, TestEvent.class)
        .withName("patientLastTestLoader")
        .registerMappedBatchLoader(
            (patientIds, batchLoaderEnvironment) -> {
              Map<UUID, TestEvent> found =
                  testEventRepository.findLastTestsByPatient(patientIds).stream()
                      .collect(Collectors.toMap(TestEvent::getPatientInternalID, s -> s));
              return Mono.just(found);
            });

    Class<List<PhoneNumber>> phoneNumberListClazz = (Class) List.class;
    registry
        .forTypePair(UUID.class, phoneNumberListClazz)
        .withName("patientPhoneNumbersLoader")
        .registerMappedBatchLoader(
            (patientIds, batchLoaderEnvironment) -> {
              Map<UUID, List<PhoneNumber>> found =
                  phoneNumberRepository.findAllByPersonInternalIdIn(patientIds).stream()
                      .collect(Collectors.groupingBy(PhoneNumber::getPersonInternalID));

              return Mono.just(found);
            });

    registry
        .forTypePair(UUID.class, PhoneNumber.class)
        .withName("patientPrimaryPhoneNumberLoader")
        .registerMappedBatchLoader(
            (patientIds, batchLoaderEnvironment) -> {
              Map<UUID, PhoneNumber> found =
                  phoneNumberRepository
                      .findPrimaryPhoneNumberByPersonInternalIdIn(patientIds)
                      .stream()
                      .collect(Collectors.toMap(PhoneNumber::getPersonInternalID, s -> s));

              return Mono.just(found);
            });
  }

  @SchemaMapping(typeName = "Patient", field = "lastTest")
  public CompletableFuture<TestEvent> getLastTest(
      Person person, DataLoader<UUID, TestEvent> patientLastTestLoader) {
    return patientLastTestLoader.load(person.getInternalId());
  }

  @SchemaMapping(typeName = "Patient", field = "phoneNumbers")
  public CompletableFuture<List<PhoneNumber>> getPhoneNumbers(
      Person person, DataLoader<UUID, List<PhoneNumber>> patientPhoneNumbersLoader) {
    return patientPhoneNumbersLoader
        .load(person.getInternalId())
        .thenApply(
            phoneNumbers -> {
              if (phoneNumbers == null) {
                return Collections.emptyList();
              }
              return phoneNumbers;
            });
  }

  @SchemaMapping(typeName = "Patient", field = "telephone")
  public CompletableFuture<String> getPrimaryPhoneNumbers(
      Person person, DataLoader<UUID, PhoneNumber> patientPrimaryPhoneNumberLoader) {
    return patientPrimaryPhoneNumberLoader
        .load(person.getInternalId())
        .thenApply(phoneNumber -> phoneNumber == null ? "" : phoneNumber.getNumber());
  }

  @SchemaMapping(typeName = "Patient", field = "facility")
  public ApiFacility facility(Person patient) {
    Facility f = patient.getFacility();
    return f == null ? null : new ApiFacility(f);
  }

  @Override
  @SchemaMapping(typeName = "Patient", field = "id")
  public UUID getId(Person patient) {
    return patient.getInternalId();
  }

  @Override
  @SchemaMapping(typeName = "Patient", field = "name")
  public PersonName getName(Person patient) {
    return patient.getNameInfo();
  }
}
