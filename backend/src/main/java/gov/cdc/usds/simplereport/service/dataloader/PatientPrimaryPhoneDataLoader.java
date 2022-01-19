package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
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
                  log.debug("Patient IDs");
                  log.debug(
                      patients.stream()
                          .map(Person::getInternalId)
                          .collect(Collectors.toList())
                          .toString());

                  List<UUID> phoneIds =
                      patients.stream()
                          .map(p -> p.getPrimaryPhone().getInternalId())
                          .collect(Collectors.toList());

                  log.debug("Phone IDs");
                  log.debug(phoneIds.toString());

                  Map<UUID, PhoneNumber> found =
                      phoneNumberRepository.findAllByInternalIdIn(phoneIds).stream()
                          .collect(Collectors.toMap(PhoneNumber::getInternalId, s -> s));

                  log.debug("Found phone numbers");
                  log.debug(found.toString());

                  List<PhoneNumber> patientPhoneNumbers =
                      patients.stream()
                          .map(p -> found.getOrDefault(p.getPrimaryPhone().getInternalId(), null))
                          .collect(Collectors.toList());

                  log.debug("Patient phone numbers");
                  log.debug(patientPhoneNumbers.toString());

                  return patientPhoneNumbers;
                }));
  }
}
