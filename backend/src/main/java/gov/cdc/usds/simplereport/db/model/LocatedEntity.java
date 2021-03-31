package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

/** Marker interface for an entity that has a street address */
public interface LocatedEntity {

  StreetAddress getAddress();

}
