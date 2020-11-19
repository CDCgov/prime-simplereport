package gov.cdc.usds.simplereport.api;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.api.model.TestOrder;
import gov.cdc.usds.simplereport.api.model.TestResult;
import gov.cdc.usds.simplereport.api.model.User;
import graphql.schema.DataFetcher;

@Service
@SuppressWarnings("checkstyle:MagicNumber")
public class DummyDataRepo {

	private static DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	// set up or devices
	// private DeviceType device1 = new Device("Quidel Sofia 2","Quidel","Sofia 2");
	// public ArrayList<DeviceType> allDevices = new ArrayList<>(Arrays.asList(
	// 	device1,
	// 	new Device("BD Veritor","BD","Veritor"),
	// 	new Device("Abbott Binax Now","Abbott","Binax Now"),
	// 	new Device("Abbott IDNow","Abbott","IDNow"),
	// 	new Device("LumiraDX","LumiraDX","")
	// ));
	// public DataFetcher<List<DeviceType>> deviceFetcher() {
	// 	return (env) -> allDevices;
	// }

	// set up default user and org
	public Organization defaultOrg = new Organization("Feel Good Inc", "clia1234");
	public User defaultUser = new User(defaultOrg);

	// add patients to org
	// private Person patient1 = new Person(defaultOrg, "patientId1", "Edward", "", "Teach", LocalDate.of(1717, 1, 1), "123 Plank St", "", "Nassau", "NY", "12065",  "(123) 456-7890", "", "", "", "", "", "", false, false);
	// private Person patient3 = new Person(defaultOrg, "patientId3", "John", "\"Long\"", "Silver", LocalDate.of(1729, 1, 1), "123 cat St", "", "lake view", "MI", "12067", "(213) 645-7890)", "", "", "", "", "", "", false, false);

	// create test results
	// private TestResult testResult1 = new TestResult(device1, "positive", patient1);
	// private TestResult testResult2 = new TestResult(device1, "negative", patient1);
	// private TestResult testResult3 = new TestResult(device1, "inconclusive", patient3);

	public ArrayList<Person> allPatients = new ArrayList<>(Arrays.asList(
		// patient1,
		// new Person(defaultOrg, "patientId2", "James", "D.", "Flint", LocalDate.of(1719, 1, 1), "123 dog St", "apt 2", "Jamestown", "VT", "12068", "(321) 546-7890", "", "", "", "", "", "", false, false),
		// patient3,
		// new Person(defaultOrg, "patientId4","Sally","Mae","Map", LocalDate.of(1922, 1, 1),"123 bird St", "", "mountain top", "VA", "12075","(243) 635-7190", "", "", "", "", "", "", false, false),
		// new Person(defaultOrg, "patientId5","Apollo","Graph","QL", LocalDate.of(1901, 1, 1),"987 Plank St", "", "town name", "CA", "15065","(243) 555-5555",  "", "", "", "", "", "", false, false)
	));

	public ArrayList<TestResult> allTestResults = new ArrayList<>(Arrays.asList(
		// testResult1,
		// testResult2,
		// testResult3
	));

	public DataFetcher<List<TestResult>> testResultFetcher() {
		return (env) -> allTestResults;
	}

	public  DataFetcher<User> userFetcher() {
		return (env) -> defaultUser;
	}

	public ArrayList<TestOrder> queue = new ArrayList<>();

	public DataFetcher<List<TestOrder>> queueFetcher() {
		return (env) -> queue;
	}

	public Person getPatient(String patientId) {
		// for(Person p : allPatients) {
		// 	if(p.getInternalId().equals(patientId)) {
		// 		return p;
		// 	}
		// }
		return null;
	}

	DeviceType getDevice(String deviceId) {
		// for(Device d : allDevices) {
		// 	if(d.getId().equals(deviceId)) {
		// 		return d;
		// 	}
		// }
		return null;
	}

	public String addTestResult(
		String deviceId,
		String result,
		String patientId
	) {
		return "";
		// Person patient = this.getPatient(patientId);
		// TestResult newTestResult = new TestResult(
		// 	this.getDevice(deviceId),
		// 	result,
		// 	patient
		// );
		// patient.addTestResult(newTestResult);
		// allTestResults.add(newTestResult);
		// return newTestResult.getId();
	}

	public String addPatientToQueue(
		String patientId,
		String pregnancy,
		String symptoms,
		Boolean firstTest,
		String priorTestDate,
		String priorTestType,
		String priorTestResult,
		String symptomOnset,
		Boolean noSymptoms
	) {
		return "";

		// Person patient = this.getPatient(patientId);
		// TestOrder newTestOrder = new TestOrder(
		// 	patient,
		// 	defaultOrg
		// );
		// queue.add(newTestOrder);
		// LocalDate localSymptomOnset = (symptomOnset == null) ? null : LocalDate.parse(symptomOnset, this.dateTimeFormatter);
		// LocalDate localPriorTestDate = (priorTestDate == null) ? null : LocalDate.parse(priorTestDate, this.dateTimeFormatter);

		// newTestOrder.setSurveyResponses(
		// 	pregnancy,
		// 	symptoms,
		// 	firstTest,
		// 	localPriorTestDate,
		// 	priorTestType,
		// 	priorTestResult,
		// 	localSymptomOnset,
		// 	noSymptoms
		// );
		// // newTestOrder.setDevice(defaultOrg.getDefaultDeviceType());
		// return newTestOrder.getId();
	}

	public int getQueueIndexByPatientId(String patientId) {
		int index = 0;
		while(index < queue.size()) {
			  TestOrder order = queue.get(index);
				if(order.getPatientId().equals(patientId)) {
					return index;
				}
				index++;
		} 
		return -1;
	}

	public String removePatientFromQueue(String patientId) {
		int index = this.getQueueIndexByPatientId(patientId);
		queue.remove(index);
		return "";
	}

	public String updateTimeOfTestQuestions(
		String patientId,
		String pregnancy,
		String symptoms,
		Boolean firstTest,
		String priorTestDate,
		String priorTestType,
		String priorTestResult,
		String symptomOnset,
		Boolean noSymptoms
	) {
		TestOrder testOrder = queue.get(this.getQueueIndexByPatientId(patientId));
		LocalDate localSymptomOnset = (symptomOnset == null) ? null : LocalDate.parse(symptomOnset, this.dateTimeFormatter);
		LocalDate localPriorTestDate = (priorTestDate == null) ? null : LocalDate.parse(priorTestDate, this.dateTimeFormatter);

		testOrder.setSurveyResponses(
			pregnancy,
			symptoms,
			firstTest,
			localPriorTestDate,
			priorTestType,
			priorTestResult,
			localSymptomOnset,
			noSymptoms
		);
		return "";
	}

	public void init_relations() {
		// patient1.setTestResults(new ArrayList<>(Arrays.asList(testResult1, testResult2)));
		// patient3.setTestResults(new ArrayList<>(Arrays.asList(testResult3)));
	}
}
