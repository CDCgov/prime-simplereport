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
public class ApiFacilityPatientSelfRegistrationLinkDataLoader
    extends KeyedDataLoaderFactory<UUID, String> {
  public static final String KEY = "facility[*].patientSelfRegistrationLink";

  @Override
  public String getKey() {
    return KEY;
  }

  ApiFacilityPatientSelfRegistrationLinkDataLoader(
      PatientRegistrationLinkRepository patientSelfRegistrationLinkRepository) {
    super(
        facilityIds ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, PatientSelfRegistrationLink> found =
                      patientSelfRegistrationLinkRepository
                          .findAllByFacilityInternalIdIn(facilityIds)
                          .stream()
                          .collect(
                              Collectors.toMap(
                                  srl -> srl.getFacility().getInternalId(), Function.identity()));

                  return facilityIds.stream()
                      .map(facilityId -> found.get(facilityId).getLink())
                      .collect(Collectors.toList());
                }));
  }
}
