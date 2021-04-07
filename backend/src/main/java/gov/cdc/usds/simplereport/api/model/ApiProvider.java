package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.LocatedWrapper;
import gov.cdc.usds.simplereport.api.model.facets.PersonWrapper;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;

public class ApiProvider extends WrappedEntity<Provider>
    implements PersonWrapper<Provider>, LocatedWrapper<Provider> {

  public ApiProvider(Provider orderingProvider) {
    super(orderingProvider);
  }

  public String getNPI() {
    return getWrapped().getProviderId();
  }

  public String getPhone() {
    return getWrapped().getTelephone();
  }
}
