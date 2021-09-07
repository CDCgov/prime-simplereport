package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.service.dataloader.ApiOrganizationPatientSelfRegistrationLinkDataLoader;
import graphql.kickstart.tools.GraphQLResolver;
import graphql.schema.DataFetchingEnvironment;
import java.util.concurrent.CompletableFuture;
import org.springframework.stereotype.Component;

@Component
public class ApiOrganizationDataResolver implements GraphQLResolver<ApiOrganization> {
  private final ApiOrganizationPatientSelfRegistrationLinkDataLoader
      _apiOrganizationPatientSelfRegistrationLinkDataLoader;

  public ApiOrganizationDataResolver(
      ApiOrganizationPatientSelfRegistrationLinkDataLoader
          apiOrganizationPatientSelfRegistrationLinkDataLoader) {
    _apiOrganizationPatientSelfRegistrationLinkDataLoader =
        apiOrganizationPatientSelfRegistrationLinkDataLoader;
  }

  public CompletableFuture<String> getPatientSelfRegistrationLink(
      ApiOrganization org, DataFetchingEnvironment dfe) {
    return _apiOrganizationPatientSelfRegistrationLinkDataLoader.load(org.getInternalId(), dfe);
  }
}
