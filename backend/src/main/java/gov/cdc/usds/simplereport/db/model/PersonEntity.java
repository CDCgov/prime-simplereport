package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

/** Marker interface for entities that represent a person with a name. */
public interface PersonEntity {

  PersonName getNameInfo();
}
