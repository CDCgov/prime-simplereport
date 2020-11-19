package gov.cdc.usds.simplereport.api.model;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.DeviceType;

import java.time.LocalDate;
import java.util.UUID;

public class TestOrder {

	private String id;
	private Person patient;
	private Organization organization;
	private LocalDate dateAdded;
	private String pregnancy;
	private String symptoms; // JSON object
	private Boolean noSymptoms;
	private Boolean firstTest;
	private LocalDate priorTestDate;
	private LocalDate symptomOnset;
	private String priorTestType;
	private String priorTestResult;
	private String result;
	private DeviceType device;
	private TestResult testResult;

	public TestOrder(
    Person patient,
    Organization organization
	) {
		super();
		this.id = UUID.randomUUID().toString();
		this.patient = patient;
    this.organization = organization;
    this.dateAdded = LocalDate.now();
	}

	public void setDevice(DeviceType device) {
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
		LocalDate symptomOnset,
		Boolean noSymptoms
	) {
		this.pregnancy = pregnancy;
		this.symptoms = symptoms;
		this.firstTest = firstTest;
		this.priorTestDate = priorTestDate;
		this.priorTestType = priorTestType;
		this.priorTestResult = priorTestResult;
		this.symptomOnset = symptomOnset;
		this.noSymptoms = noSymptoms;
	}

	public String getId() {
		return id;
	}

	public String getPatientId() {
		return "" ;//this.patient.getId();
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

	public Boolean getNoSymptoms() {
		return this.noSymptoms;
	}

	public DeviceType getDeviceType() {
		return this.device;
	}
}
