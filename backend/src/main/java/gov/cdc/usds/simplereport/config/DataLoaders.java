package gov.cdc.usds.simplereport.config;

import static java.util.concurrent.CompletableFuture.supplyAsync;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.repository.PatientPreferencesRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.dataloader.DataLoader;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

@Component
public class DataLoaders {
  private final PatientPreferencesRepository patientPreferencesRepository;
  private final TestEventRepository testEventRepository;
  public static final String PATIENT_LAST_TEST = "patients[*].lastTest";
  public static final String PATIENT_PREFERENCES = "patients[*].preferences";

  public DataLoaders(
      PatientPreferencesRepository patientPreferencesRepository,
      TestEventRepository testEventRepository) {
    this.patientPreferencesRepository = patientPreferencesRepository;
    this.testEventRepository = testEventRepository;
  }

  private DataLoader<UUID, PatientPreferences> createPatientPreferencesLoader() {
    return new DataLoader<>(
        patientIds ->
            supplyAsync(
                () -> {
                  Map<UUID, PatientPreferences> found =
                      patientPreferencesRepository.findAllByPersonInternalIdIn(patientIds).stream()
                          .collect(Collectors.toMap(PatientPreferences::getInternalId, s -> s));
                  return patientIds.stream()
                      .map(p -> found.getOrDefault(p, PatientPreferences.DEFAULT))
                      .collect(Collectors.toList());
                }));
  }

  private DataLoader<UUID, TestEvent> createTestEventDataLoader() {
    return new DataLoader<>(
        patientIds ->
            supplyAsync(
                () -> {
                  Map<UUID, TestEvent> found =
                      testEventRepository.findLastTestsByPatient(patientIds).stream()
                          .collect(Collectors.toMap(TestEvent::getPatientInternalID, s -> s));
                  return patientIds.stream()
                      .map(te -> found.getOrDefault(te, null))
                      .collect(Collectors.toList());
                }));
  }

  public DataLoaderRegistry buildRegistry() {
    DataLoaderRegistry dataLoaderRegistry = new DataLoaderRegistry();
    dataLoaderRegistry.register(PATIENT_PREFERENCES, createPatientPreferencesLoader());
    dataLoaderRegistry.register(PATIENT_LAST_TEST, createTestEventDataLoader());
    return dataLoaderRegistry;
  }
}
