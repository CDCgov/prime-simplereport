package gov.cdc.usds.simplereport.api.model.facets;

import gov.cdc.usds.simplereport.db.model.PersonEntity;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.Wrapper;

/**
 * Mix-in class to handle fetching components of a person's name, or the entire name, as desired.
 *
 * @param <T> an entity representing a person with a name.
 */
public interface PersonWrapper<T extends PersonEntity> extends Wrapper<T> {

  default PersonName getName() {
    return getWrapped().getNameInfo();
  }

  default String getFirstName() {
    return getName().getFirstName();
  }

  default String getLastName() {
    return getName().getLastName();
  }

  default String getMiddleName() {
    return getName().getMiddleName();
  }

  default String getSuffix() {
    return getName().getSuffix();
  }
}
