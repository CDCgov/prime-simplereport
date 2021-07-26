package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PatientPhoneNumbersDataLoader extends KeyedDataLoaderFactory<UUID, List<PhoneNumber>> {
  public static final String KEY = "patients[*].phoneNumbers";

  @Override
  public String getKey() {
    return KEY;
  }

  PatientPhoneNumbersDataLoader(PhoneNumberRepository phoneNumberRepository) {
    super(
        patientIds ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, List<PhoneNumber>> found =
                      phoneNumberRepository.findAllByPersonInternalIdIn(patientIds).stream()
                          .flatMap(List::stream)
                          .collect(Collectors.groupingBy(PhoneNumber::getPersonInternalID));

                  return patientIds.stream()
                      .map(pn -> found.getOrDefault(pn, null))
                      .collect(Collectors.toList());
                }));
  }
}
