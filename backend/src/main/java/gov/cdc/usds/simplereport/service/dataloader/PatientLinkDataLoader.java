package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PatientLinkDataLoader extends KeyedDataLoaderFactory<UUID, PatientLink> {
  public static final String KEY = "testResults[*].patientLink";

  @Override
  public String getKey() {
    return KEY;
  }

  private static PatientLink getMostRecentPatientLink(List<PatientLink> patientLinks) {
    if (patientLinks == null) {
      return null;
    }
    patientLinks.sort(
        (pl1, pl2) -> {
          if (pl1.getCreatedAt().equals(pl2.getCreatedAt())) {
            return 0;
          } else if (pl1.getCreatedAt().before(pl2.getCreatedAt())) {
            return -1;
          } else return 1;
        });
    return patientLinks.get(0);
  }

  PatientLinkDataLoader(PatientLinkRepository patientLinkRepository) {
    super(
        testOrders ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, List<PatientLink>> found =
                      patientLinkRepository.findAllByTestOrderInternalIdIn(testOrders).stream()
                          .collect(Collectors.groupingBy(PatientLink::getTestOrderId));

                  return testOrders.stream()
                      .map(
                          to ->
                              PatientLinkDataLoader.getMostRecentPatientLink(
                                  found.getOrDefault(to, null)))
                      .collect(Collectors.toList());
                }));
  }
}
