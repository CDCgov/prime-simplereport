package gov.cdc.usds.simplereport.db.model.readonly;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.Immutable;

import gov.cdc.usds.simplereport.db.model.BaseTestInfo;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;

@Entity
@Table(name = "test_event")
@Immutable
@AttributeOverride(name = "result", column = @Column(nullable = false))
public class NoJsonTestEvent extends BaseTestInfo {

	@OneToOne(mappedBy = "testEvent")
	private NoJsonTestOrder order;

	protected NoJsonTestEvent() { /* no-op */ }

	public NoJsonTestOrder getTestOrder() {
		return order;
	}

	public Person getPatientData() {
		return getPatient();
	}

	public Provider getProviderData() {
		return getFacility().getOrderingProvider(); // this could actually be gotten from JSON
	}
}
