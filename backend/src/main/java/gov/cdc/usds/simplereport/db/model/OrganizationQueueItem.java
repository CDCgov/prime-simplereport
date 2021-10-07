package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import org.hibernate.annotations.Type;
import org.springframework.boot.context.properties.ConstructorBinding;

@Entity
@Table(name = "organization_queue")
public class OrganizationQueueItem extends EternalAuditedEntity {

  @Column(nullable = false)
  private String organizationName;

  @Column(name = "organization_external_id", nullable = false)
  private String externalId;

  @Column(nullable = false)
  @Type(type = "jsonb")
  private OrganizationAccountRequest requestData;

  @OneToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "verified_organization_id")
  private Organization verifiedOrganization;

  protected OrganizationQueueItem() {
    /* for hibernate */
  }

  @ConstructorBinding
  public OrganizationQueueItem(
      String orgName, String externalId, OrganizationAccountRequest requestData) {
    this();
    this.organizationName = orgName;
    this.externalId = externalId;
    this.requestData = requestData;
  }

  public String getOrganizationName() {
    return organizationName;
  }

  public String getExternalId() {
    return externalId;
  }

  public OrganizationAccountRequest getRequestData() {
    return requestData;
  }

  public void setVerifiedOrganization(Organization org) {
    verifiedOrganization = org;
  }
}
