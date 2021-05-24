package gov.cdc.usds.simplereport.validators;

import com.okta.commons.lang.Strings;
import gov.cdc.usds.simplereport.api.model.errors.OrderingProviderRequiredException;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.properties.OrderingProviderProperties;
import org.springframework.stereotype.Component;

@Component
public class OrderingProviderRequiredValidator {
  private final OrderingProviderProperties _config;

  public OrderingProviderRequiredValidator(OrderingProviderProperties orderingProviderProperties) {
    this._config = orderingProviderProperties;
  }

  public void assertValidity(PersonName name, String npi, String telephone, String facilityState)
      throws OrderingProviderRequiredException {
    if (!isValid(name, npi, telephone, facilityState)) {
      throw new OrderingProviderRequiredException(
          String.format("Ordering provider is required in %s", facilityState));
    }
  }

  public boolean isValid(PersonName name, String npi, String telephone, String facilityState) {
    if (_config.getStatesNotRequired().contains(facilityState.toUpperCase())) {
      return true;
    }

    return !(name == null
        || Strings.isEmpty(name.getFirstName())
        || Strings.isEmpty(name.getMiddleName())
        || Strings.isEmpty(name.getLastName())
        || Strings.isEmpty(name.getSuffix())
        || Strings.isEmpty(npi)
        || Strings.isEmpty(telephone));
  }
}
