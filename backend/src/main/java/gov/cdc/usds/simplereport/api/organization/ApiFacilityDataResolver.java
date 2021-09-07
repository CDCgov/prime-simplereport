package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.service.dataloader.ApiFacilityPatientSelfRegistrationLinkDataLoader;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.util.concurrent.CompletableFuture;
import org.springframework.stereotype.Component;

@Component
public class ApiFacilityDataResolver implements GraphQLResolver<ApiFacility> {
  private final ApiFacilityPatientSelfRegistrationLinkDataLoader
      _apiFacilityPatientSelfRegistrationLinkDataLoader;

  public ApiFacilityDataResolver(
      ApiFacilityPatientSelfRegistrationLinkDataLoader
          apiFacilityPatientSelfRegistrationLinkDataLoader) {
    _apiFacilityPatientSelfRegistrationLinkDataLoader =
        apiFacilityPatientSelfRegistrationLinkDataLoader;
  }

  public CompletableFuture<String> getPatientSelfRegistrationLink(
      ApiFacility facility, DataFetchingEnvironment dfe) {
    return _apiFacilityPatientSelfRegistrationLinkDataLoader.load(facility.getInternalId(), dfe);
  }
}
