package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.repository.PatientPreferencesRepository;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PatientPreferencesDataLoader extends KeyedDataLoaderFactory<UUID, PatientPreferences> {
  public static final String KEY = "patients[*].preferences";

  @Override
  public String getKey() {
    return KEY;
  }

  PatientPreferencesDataLoader(PatientPreferencesRepository patientPreferencesRepository) {
    super(
        patientIds ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, PatientPreferences> found =
                      patientPreferencesRepository.findAllByPersonInternalIdIn(patientIds).stream()
                          .collect(Collectors.toMap(PatientPreferences::getInternalId, s -> s));
                  return patientIds.stream()
                      .map(p -> found.getOrDefault(p, PatientPreferences.DEFAULT))
                      .collect(Collectors.toList());
                }));
  }
}
