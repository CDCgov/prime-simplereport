package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class DeviceTypeDataResolver {

  public DeviceTypeDataResolver(
      BatchLoaderRegistry registry, DeviceTypeDataLoaderService deviceTypeDataLoaderService) {

    Class<List<SupportedDisease>> supportedDiseasesListClazz = (Class) List.class;
    registry
        .forTypePair(UUID.class, supportedDiseasesListClazz)
        .withName("deviceTypeSupportedDiseasesLoader")
        .registerMappedBatchLoader(
            (deviceTypeIds, batchLoaderEnvironment) ->
                Mono.just(deviceTypeDataLoaderService.getSupportedDiseases(deviceTypeIds)));

    Class<List<SpecimenType>> specimenTypesListClazz = (Class) List.class;
    registry
        .forTypePair(UUID.class, specimenTypesListClazz)
        .withName("deviceTypeSpecimenTypesLoader")
        .registerMappedBatchLoader(
            (deviceTypeIds, batchLoaderEnvironment) ->
                Mono.just(deviceTypeDataLoaderService.getSpecimenTypes(deviceTypeIds)));
  }

  @SchemaMapping(typeName = "DeviceType", field = "supportedDiseases")
  public CompletableFuture<List<SupportedDisease>> supportedDiseases(
      DeviceType deviceType,
      DataLoader<UUID, List<SupportedDisease>> deviceTypeSupportedDiseasesLoader) {
    return deviceTypeSupportedDiseasesLoader.load(deviceType.getInternalId());
  }

  @SchemaMapping(typeName = "DeviceType", field = "swabTypes")
  public CompletableFuture<List<SpecimenType>> swabTypes(
      DeviceType deviceType, DataLoader<UUID, List<SpecimenType>> deviceTypeSpecimenTypesLoader) {
    return deviceTypeSpecimenTypesLoader.load(deviceType.getInternalId());
  }
}
