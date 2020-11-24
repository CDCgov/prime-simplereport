package gov.cdc.usds.simplereport.service.model;

import java.util.function.Supplier;

/** 
 * Specialization for a lambda function that tells us what we want to know
 * about the current user.
 */
public interface IdentitySupplier extends Supplier<IdentityAttributes> {

}
