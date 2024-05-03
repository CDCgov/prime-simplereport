package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

/*
Question: do we need the Role table? it seems to just be a wrapper for the OrganizationRole
we are creating an entity to represent role that will simply be the UUID and the OrganizationRole
while still maintaining the OrganizationRole enum in our code. why not have api_user_role have
2 columns: api_user_id and OrganizationRole.

another option? - role is a field on api_user and all_facility is a boolean field
a user will not have two of any other kind of role
 */

@Entity
@Table(name = "role")
public class UserRole extends IdentifiedEntity {
  @Column @Getter private String name;

  //  // need this when updating an ApiUser's UserRoles given one or more OrganizationRoles
  //  // ? make a rolesrepo so we can query UserRoles by OrganizationRole
  //  // or load roles on init like we do with supporteddiseases so we can just reference them
  // without hitting DB
  //  public static getRoleForRole(OrganizationRole role) {
  //  }
}
