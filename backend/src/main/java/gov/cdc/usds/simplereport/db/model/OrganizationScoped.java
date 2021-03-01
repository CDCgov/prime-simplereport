package gov.cdc.usds.simplereport.db.model;

/**
 * Marker interface for an entity that is tied to a specific {@link Organization}. Generally
 * speaking, the Organization is not exposed to the user, because the user is only authorized to
 * items that belong to their own organization: rather, entities with this interface should always
 * be filtered by organization, and are candidates for database-managed row-level security.
 */
public interface OrganizationScoped {

  /**
   * The organization to which this entity belongs. The only time you should actually need to call
   * this method is when you are initializing a new {@link OrganizationScoped} entity based on a
   * relationship to another entity within the same organization, at which point initializing the
   * {@code organization} field of the new entity should be done based on the related entity, rather
   * than requiring the organization to be passed in separately.
   *
   * @return a non-null {@link Organization} object.
   */
  Organization getOrganization();
}
