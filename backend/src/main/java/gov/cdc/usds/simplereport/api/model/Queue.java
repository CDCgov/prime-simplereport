package gov.cdc.usds.simplereport.api.model;

import java.util.ArrayList;
import java.time.LocalDate;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.Organization;
import gov.cdc.usds.simplereport.api.model.Patient;

public class Queue {

	private String id;
	private Patient patient;
  private Organization organization;
  private LocalDate dateAdded;

	public Queue(
    Patient patient,
    Organization organization
	) {
		super();
		this.id = UUID.randomUUID().toString();
		this.patient = patient;
    this.organization = organization;
    this.dateAdded = LocalDate.now();
	}


	public String getId() {
		return id;
	}
}
