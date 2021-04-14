package gov.cdc.usds.simplereport.api.model.facets;

import gov.cdc.usds.simplereport.db.model.LocatedEntity;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.model.Wrapper;
import java.util.Optional;
import java.util.function.Function;

/**
 * Mix-in interface to handle retrieving individual address fields, or the entire address object, as
 * required.
 *
 * @param <T> an entity that has a street address
 */
public interface LocatedWrapper<T extends LocatedEntity> extends Wrapper<T> {

  default StreetAddress getAddress() {
    return getWrapped().getAddress();
  }

  default String getAddressField(Function<? super StreetAddress, String> mapper) {
    return Optional.ofNullable(getAddress()).map(mapper).orElse("");
  }

  default String getStreet() {
    return getAddressField(StreetAddress::getStreetOne);
  }

  default String getStreetTwo() {
    return getAddressField(StreetAddress::getStreetTwo);
  }

  default String getCity() {
    return getAddressField(StreetAddress::getCity);
  }

  default String getCounty() {
    return getAddressField(StreetAddress::getCounty);
  }

  default String getState() {
    return getAddressField(StreetAddress::getState);
  }

  default String getZipCode() {
    return getPostalCode();
  }

  default String getPostalCode() {
    return getAddressField(StreetAddress::getPostalCode);
  }
}
