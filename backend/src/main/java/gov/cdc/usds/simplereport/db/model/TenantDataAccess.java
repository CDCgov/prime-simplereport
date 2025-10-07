package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PermissionsData;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.Type;

@Entity
public class TenantDataAccess extends EternalAuditedEntity {

  // the ApiUser who will be granted tenant access
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "api_user_internal_id", updatable = false)
  private ApiUser grantedToApiUser;

  // the Organization the ApiUser will be granted access to
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_internal_id", updatable = false)
  private Organization organization;

  // contains the authorities to be loaded into Authentication
  @Column(nullable = false)
  @Type(type = "jsonb")
  private PermissionsData permissionsData;

  @Column(nullable = false)
  private String justification;

  @Column(nullable = false)
  private Date expiresAt;

  protected TenantDataAccess() {
    /* for hibernate */
  }

  public TenantDataAccess(
      ApiUser apiUser,
      Organization org,
      PermissionsData permissionsData,
      String justification,
      Date expiresAt) {
    super();
    this.grantedToApiUser = apiUser;
    this.organization = org;
    this.permissionsData = permissionsData;
    this.justification = justification;
    this.expiresAt = expiresAt;
  }

  public ApiUser getGrantedToApiUser() {
    return grantedToApiUser;
  }

  public Organization getOrganization() {
    return organization;
  }

  public PermissionsData getPermissionsData() {
    return permissionsData;
  }

  public String getJustification() {
    return justification;
  }

  public boolean isExpired() {
    return expiresAt.before(new Date());
  }
}
