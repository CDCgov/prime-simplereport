package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import org.hibernate.annotations.NaturalId;
import org.springframework.boot.context.properties.ConstructorBinding;

@Entity
public class Organization extends EternalAuditedEntity {

  @Column(nullable = false, unique = true)
  private String organizationName;

  @Column private String organizationType;

  @Column(name = "organization_external_id", nullable = false, unique = true)
  @NaturalId
  private String externalId;

  @Column(nullable = false)
  private boolean identityVerified;

  protected Organization() {
    /* for hibernate */
  }

  @ConstructorBinding
  public Organization(String orgName, String orgType, String externalId, boolean identityVerified) {
    this();
    this.organizationName = orgName;
    this.organizationType = orgType;
    this.externalId = externalId;
    this.identityVerified = identityVerified;
  }

  public String getOrganizationName() {
    return organizationName;
  }

  public void setOrganizationName(String newName) {
    organizationName = newName;
  }

  public String getOrganizationType() {
    return organizationType;
  }

  public void setOrganizationType(String newType) {
    organizationType = newType;
  }

  public String getExternalId() {
    return externalId;
  }

  public boolean getIdentityVerified() {
    return identityVerified;
  }

  public void setIdentityVerified(boolean newStatus) {
    identityVerified = newStatus;
  }
}
