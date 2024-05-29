package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@NoArgsConstructor
@Table(name = "api_user_role")
public class ApiUserRole extends IdentifiedEntity {

  @Column(name = "api_user_id")
  @Setter
  private UUID apiUserId;

  @ManyToOne
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Column(nullable = false, columnDefinition = "organization_role")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Enumerated(EnumType.STRING)
  private OrganizationRole role;

  public ApiUserRole(Organization org, OrganizationRole role) {
    this.organization = org;
    this.role = role;
  }
}
