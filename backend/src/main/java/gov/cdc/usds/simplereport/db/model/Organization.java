package gov.cdc.usds.simplereport.db.model;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

import org.hibernate.annotations.NaturalId;
import org.springframework.boot.context.properties.ConstructorBinding;

@Entity
public class Organization extends EternalEntity {

	@Column(nullable = false, unique = true)
	private String organizationName;

	@Column(name="organization_external_id", nullable=false, unique=true)
	@NaturalId
	private String externalId;

	protected Organization() { /* for hibernate */ }

	@ConstructorBinding
	public Organization(String orgName, String externalId) {
		this();
		this.organizationName = orgName;
		this.externalId = externalId;
	}

	public String getOrganizationName() {
		return organizationName;
	}

	public void setOrganizationName(String newName) {
		organizationName = newName;
	}

	public String getExternalId() {
		return externalId;
	}
}
