package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity(name = "api_user_role")
public class ApiUserRole extends AuditedEntity {

  @ManyToOne
  @JoinColumn(name = "api_user_id", nullable = false)
  private ApiUser apiUser;

  @ManyToOne
  @JoinColumn(name = "organization_id", nullable = false)
  private Organization organization;

  @Column(nullable = false, columnDefinition = "organization_role")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Enumerated(EnumType.STRING)
  @Getter
  private OrganizationRole role;

  protected ApiUserRole() {
    /* for hibernate */
  }

  public ApiUserRole(ApiUser user, Organization org, OrganizationRole role) {
    if (role.equals(OrganizationRole.NO_ACCESS)) {
      throw new IllegalArgumentException(
          "Invalid role NO_ACCESS when creating new user role assignment");
    }
    this.apiUser = user;
    this.organization = org;
    this.role = role;
  }
}
