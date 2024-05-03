package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

/*
Question: do we need the Role table? it seems to just be a wrapper for the OrganizationRole
should we create an entity to represent role that will simply be the UUID and the OrganizationRole
while still maintaining the OrganizationRole enum in our code? why not have api_user_role have
2 columns: api_user_id and OrganizationRole.
 */

@Entity
@Table(name = "role")
public class UserRole extends IdentifiedEntity {
  @Column @Getter private OrganizationRole organizationRole;
}
