package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ApiOrganizationPatientSelfRegistrationLinkDataLoader
    extends KeyedDataLoaderFactory<UUID, String> {
  public static final String KEY = "organization[*].patientSelfRegistrationLink";

  @Override
  public String getKey() {
    return KEY;
  }

  ApiOrganizationPatientSelfRegistrationLinkDataLoader(
      PatientRegistrationLinkRepository patientSelfRegistrationLinkRepository) {
    super(
        organizationIds ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, PatientSelfRegistrationLink> found =
                      patientSelfRegistrationLinkRepository
                          .findAllByOrganizationInternalIdIn(organizationIds)
                          .stream()
                          .collect(
                              Collectors.toMap(
                                  srl -> srl.getOrganization().getInternalId(),
                                  Function.identity()));

                  return organizationIds.stream()
                      .map(orgId -> found.get(orgId).getLink())
                      .collect(Collectors.toList());
                }));
  }
}
