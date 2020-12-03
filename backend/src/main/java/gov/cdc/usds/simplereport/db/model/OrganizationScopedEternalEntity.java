package gov.cdc.usds.simplereport.db.model;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

import com.fasterxml.jackson.annotation.JsonIgnore;

@MappedSuperclass
public class OrganizationScopedEternalEntity extends EternalEntity {

	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id", updatable = false)
	@JsonIgnore
	private Organization organization;

	public OrganizationScopedEternalEntity() {
		super();
	}

	public OrganizationScopedEternalEntity(Organization org) {
		organization = org;
	}

	public Organization getOrganization() {
		return organization;
	}

}