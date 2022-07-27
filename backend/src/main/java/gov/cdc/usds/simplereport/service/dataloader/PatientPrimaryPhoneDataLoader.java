package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.util.HashMap;
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

  private static final int limit = 5000;

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

                  var res = new HashMap<UUID, PhoneNumber>();
                  var processed = 0;
                  while (processed < phoneIds.size()) {
                    var window = Math.min(limit, phoneIds.size() - processed);
                    processed += window;
                    var subList = phoneIds.subList(res.size(), res.size() + window);
                    Map<UUID, PhoneNumber> found =
                        phoneNumberRepository.findAllByInternalIdIn(subList).stream()
                            .collect(Collectors.toMap(PhoneNumber::getInternalId, s -> s));
                    res.putAll(found);
                  }

                  return patients.stream()
                      .map(p -> res.getOrDefault(p.getPrimaryPhone().getInternalId(), null))
                      .collect(Collectors.toList());
                }));
  }
}
