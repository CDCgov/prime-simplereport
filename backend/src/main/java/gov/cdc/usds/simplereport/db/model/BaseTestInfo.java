package gov.cdc.usds.simplereport.db.model;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class BaseTestInfo extends AuditedEntity {

	@ManyToOne(optional = false)
	@JoinColumn(name = "patient_id")
	private Person patient;
	@ManyToOne(optional = false)
	@JoinColumn(name = "organization_id")
	private Organization organization;

	protected BaseTestInfo() {
		super();
	}

	protected BaseTestInfo(Person patient) {
		this.organization = patient.getOrganization();
		this.patient = patient;
	}

	public Person getPatient() {
		return patient;
	}

	public Organization getOrganization() {
		return organization;
	}

}