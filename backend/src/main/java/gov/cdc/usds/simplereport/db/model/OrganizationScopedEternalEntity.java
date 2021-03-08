package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class OrganizationScopedEternalEntity extends EternalAuditedEntity
    implements OrganizationScoped {

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", updatable = false)
  @JsonIgnore
  private Organization organization;

  protected OrganizationScopedEternalEntity() {
    super();
  }

  protected OrganizationScopedEternalEntity(Organization org) {
    organization = org;
  }

  @Override
  public Organization getOrganization() {
    return organization;
  }
}
