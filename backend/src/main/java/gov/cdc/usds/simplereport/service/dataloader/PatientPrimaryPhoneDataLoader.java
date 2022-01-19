package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PatientPrimaryPhoneDataLoader extends KeyedDataLoaderFactory<Person, PhoneNumber> {
  public static final String KEY = "patients[*].primary_phone";

  @Override
  public String getKey() {
    return KEY;
  }

  PatientPrimaryPhoneDataLoader(PhoneNumberRepository phoneNumberRepository) {
    super(
        patients ->
            CompletableFuture.supplyAsync(
                () -> {
                  var phoneIds =
                      patients.stream()
                          .map(Person::getPrimaryPhone)
                          .map(PhoneNumber::getInternalId)
                          .collect(Collectors.toList());

                  Map<UUID, PhoneNumber> found =
                      phoneNumberRepository.findAllByInternalIdIn(phoneIds).stream()
                          .collect(Collectors.toMap(PhoneNumber::getInternalId, s -> s));

                  return patients.stream()
                      .map(p -> found.getOrDefault(p.getPrimaryPhone().getInternalId(), null))
                      .collect(Collectors.toList());
                }));
  }
}
