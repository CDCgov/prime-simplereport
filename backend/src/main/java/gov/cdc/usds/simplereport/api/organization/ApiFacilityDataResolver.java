package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class ApiFacilityDataResolver {

  public ApiFacilityDataResolver(
      BatchLoaderRegistry registry,
      PatientRegistrationLinkRepository patientSelfRegistrationLinkRepository) {

    registry
        .forTypePair(UUID.class, PatientSelfRegistrationLink.class)
        .withName("apiFacilityPatientSelfRegistrationLinkDataLoader")
        .registerMappedBatchLoader(
            (uuids, batchLoaderEnvironment) -> {
              Map<UUID, PatientSelfRegistrationLink> found =
                  patientSelfRegistrationLinkRepository
                      .findAllByFacilityInternalIdIn(uuids)
                      .stream()
                      .collect(
                          Collectors.toMap(
                              srl -> srl.getFacility().getInternalId(), Function.identity()));
              return Mono.just(found);
            });
  }

  @SchemaMapping(typeName = "Facility", field = "patientSelfRegistrationLink")
  public CompletableFuture<String> patientSelfRegistrationLink(
      ApiFacility facility,
      DataLoader<UUID, PatientSelfRegistrationLink>
          apiFacilityPatientSelfRegistrationLinkDataLoader) {
    return apiFacilityPatientSelfRegistrationLinkDataLoader
        .load(facility.getInternalId())
        .thenApply(PatientSelfRegistrationLink::getLink);
  }
}
