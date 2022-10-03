package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiOrganization;
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
public class ApiOrganizationDataResolver {

  public ApiOrganizationDataResolver(
      BatchLoaderRegistry registry,
      PatientRegistrationLinkRepository patientSelfRegistrationLinkRepository) {

    registry
        .forTypePair(UUID.class, PatientSelfRegistrationLink.class)
        .withName("apiOrganizationPatientSelfRegistrationLinkDataLoader")
        .registerMappedBatchLoader(
            (uuids, batchLoaderEnvironment) -> {
              Map<UUID, PatientSelfRegistrationLink> found =
                  patientSelfRegistrationLinkRepository
                      .findAllByOrganizationInternalIdIn(uuids)
                      .stream()
                      .collect(
                          Collectors.toMap(
                              srl -> srl.getOrganization().getInternalId(), Function.identity()));
              return Mono.just(found);
            });
  }

  @SchemaMapping(typeName = "Organization", field = "patientSelfRegistrationLink")
  public CompletableFuture<String> patientSelfRegistrationLink(
      ApiOrganization org,
      DataLoader<UUID, PatientSelfRegistrationLink>
          apiOrganizationPatientSelfRegistrationLinkDataLoader) {
    return apiOrganizationPatientSelfRegistrationLinkDataLoader
        .load(org.getInternalId())
        .thenApply(PatientSelfRegistrationLink::getLink);
  }
}
