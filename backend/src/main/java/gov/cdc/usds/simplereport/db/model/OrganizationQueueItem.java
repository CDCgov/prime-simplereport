package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@Entity
@Table(name = "organization_queue")
@Getter
@NoArgsConstructor
public class OrganizationQueueItem extends EternalAuditedEntity {

  @Column(nullable = false)
  private String organizationName;

  @Column(name = "organization_external_id", nullable = false)
  private String externalId;

  @Column(nullable = false)
  @Type(JsonBinaryType.class)
  private OrganizationAccountRequest requestData;

  @OneToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "verified_organization_id")
  private Organization verifiedOrganization;

  @ConstructorBinding
  public OrganizationQueueItem(
      String orgName, String externalId, OrganizationAccountRequest requestData) {
    this();
    this.organizationName = orgName;
    this.externalId = externalId;
    this.requestData = requestData;
  }

  public OrganizationQueueItem editOrganizationQueueItem(
      String orgName, String externalId, OrganizationAccountRequest requestData) {
    this.organizationName = orgName;
    this.externalId = externalId;
    this.requestData = requestData;
    return this;
  }

  public void setVerifiedOrganization(Organization org) {
    verifiedOrganization = org;
  }
}
