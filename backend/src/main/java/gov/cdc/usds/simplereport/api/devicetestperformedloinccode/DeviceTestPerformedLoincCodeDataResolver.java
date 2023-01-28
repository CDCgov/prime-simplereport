package gov.cdc.usds.simplereport.api.devicetestperformedloinccode;

import gov.cdc.usds.simplereport.api.supporteddisease.SupportedDiseaseDataLoaderService;
import gov.cdc.usds.simplereport.db.model.DeviceTestPerformedLoincCode;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class DeviceTestPerformedLoincCodeDataResolver {

  public DeviceTestPerformedLoincCodeDataResolver(
      BatchLoaderRegistry registry,
      SupportedDiseaseDataLoaderService supportedDiseaseDataLoaderService) {
    registry
        .forTypePair(UUID.class, SupportedDisease.class)
        .withName("supportedDiseaseDataLoader")
        .registerMappedBatchLoader(
            (supportedDiseaseId, batchLoaderEnvironment) ->
                Mono.just(
                    supportedDiseaseDataLoaderService.getSupportedDisease(supportedDiseaseId)));
  }

  @SchemaMapping(typeName = "SupportedDiseaseTestPerformed", field = "supportedDisease")
  public CompletableFuture<SupportedDisease> supportedDisease(
      DeviceTestPerformedLoincCode deviceTestPerformedLoincCode,
      DataLoader<UUID, SupportedDisease> supportedDiseaseDataLoader) {
    return supportedDiseaseDataLoader.load(
        deviceTestPerformedLoincCode.getSupportedDisease().getInternalId());
  }
}
