package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.dataloader.DataLoaderRegistry;
import org.springframework.stereotype.Component;

@Component
public class PatientLastTestDataLoader extends SelfRegisteringDataLoader<UUID, TestEvent> {
  public static final String KEY = "patients[*].lastTest";

  @Override
  public String getKey() {
    return KEY;
  }

  PatientLastTestDataLoader(
      DataLoaderRegistry dataLoaderRegistry, TestEventRepository testEventRepository) {
    super(
        dataLoaderRegistry,
        patientIds ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, TestEvent> found =
                      testEventRepository.findLastTestsByPatient(patientIds).stream()
                          .collect(Collectors.toMap(TestEvent::getPatientInternalID, s -> s));
                  return patientIds.stream()
                      .map(te -> found.getOrDefault(te, null))
                      .collect(Collectors.toList());
                }));
  }
}
