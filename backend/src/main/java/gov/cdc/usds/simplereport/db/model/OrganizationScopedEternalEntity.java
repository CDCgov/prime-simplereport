package gov.cdc.usds.simplereport.db.model;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

import com.fasterxml.jackson.annotation.JsonIgnore;

@MappedSuperclass
public abstract class OrganizationScopedEternalEntity extends EternalAuditedEntity
		implements OrganizationScoped {

	@ManyToOne(optional = false)
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