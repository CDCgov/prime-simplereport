package gov.cdc.usds.simplereport.api.model;

import java.util.ArrayList;
import java.time.LocalDate;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.Organization;
import gov.cdc.usds.simplereport.api.model.Patient;
import gov.cdc.usds.simplereport.api.model.TestResult;

public class TestOrder {

	private String id;
	private Patient patient;
  private Organization organization;
	private LocalDate dateAdded;
	private String pregnancy;
	private String symptoms; // JSON object
	private Boolean firstTest;
	private LocalDate priorTestDate;
	private LocalDate symptomOnset;
	private String priorTestType;
	private String priorTestResult;
	private String result;
	private Device device;
	private TestResult testResult;

	public TestOrder(
    Patient patient,
    Organization organization
	) {
		super();
		this.id = UUID.randomUUID().toString();
		this.patient = patient;
    this.organization = organization;
    this.dateAdded = LocalDate.now();
	}

	public void setDevice(Device device) {
		this.device = device;
	}

	public void setTestResult(String result) {
		this.result = result;
	}

	public void setSurveyResponses(
		String pregnancy,
		String symptoms,
		Boolean firstTest,
		LocalDate priorTestDate,
		String priorTestType,
		String priorTestResult,
		LocalDate symptomOnset
	) {
		this.pregnancy = pregnancy;
		this.symptoms = symptoms;
		this.firstTest = firstTest;
		this.priorTestDate = priorTestDate;
		this.priorTestType = priorTestType;
		this.priorTestResult = priorTestResult;
		this.symptomOnset = symptomOnset;
	}

	public String getId() {
		return id;
	}

	public String getPatientId() {
		return this.patient.getId();
	}

	public String getPregnancy() {
		return this.pregnancy;
	}

	public String getSymptoms() {
		return this.symptoms;
	}

	public Boolean getFirstTest() {
		return this.firstTest;
	}

	public LocalDate getPriorTestDate() {
		return this.priorTestDate;
	}

	public String getPriorTestType() {
		return this.priorTestType;
	}

	public String getPriorTestResult() {
		return this.priorTestResult;
	}

	public LocalDate getSymptomOnset() {
		return this.symptomOnset;
	}
}
