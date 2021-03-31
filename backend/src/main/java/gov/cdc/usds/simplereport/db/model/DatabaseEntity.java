package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;

/**
 * Common interface to say "this is a thing we store in the database". Already being lightly abused,
 * and I haven't even committed it yet.
 */
public interface DatabaseEntity {

  UUID getInternalId();

}