package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Table(name = "api_user_role")
public class UserOrgRole extends IdentifiedEntity {
  //    @ManyToOne
  //    @JoinColumn(name="api_user_id", nullable = false)
  //    private ApiUser apiUser;

  @ManyToOne
  @JoinColumn(name = "organization_id")
  private Organization organization;

  //  @Column(nullable = false, columnDefinition = "organization_role")
  //  @Enumerated(EnumType.STRING)
  //  @Type(PostgreSQLEnumType.class)
  //  private OrganizationRole role;

  public UserOrgRole(Organization org, OrganizationRole role) {
    this.organization = org;
    //    this.role = role;
  }
}
