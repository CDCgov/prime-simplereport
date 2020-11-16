package gov.cdc.usds.simplereport.api;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Repository;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Organization;
import gov.cdc.usds.simplereport.api.model.Patient;
import gov.cdc.usds.simplereport.api.model.TestResult;
import gov.cdc.usds.simplereport.api.model.User;
import graphql.schema.DataFetcher;

@Repository
public class DummyDataRepo {

	// set up or devices
	private Device device1 =  new Device("Quidel Sofia 2","Quidel","Sofia 2", true);
	private ArrayList<Device> allDevices = new ArrayList<>(Arrays.asList(
		device1,
		new Device("BD Veritor","BD","Veritor", true),
		new Device("Abbott Binax Now","Abbott","Binax Now",false),
		new Device("Abbott IDNow","Abbott","IDNow",false),
		new Device("LumiraDX","LumiraDX","",false)
	));

	// set up default user and org
	private Organization defaultOrg = new Organization("","","","", "", "", "", "", "", "", "", allDevices);
	private User defaultUser = new User(defaultOrg);
	private ArrayList<Organization> allOrganizations = new ArrayList<>(Arrays.asList(defaultOrg));

	// add patients to org
	private Patient patient1 = new Patient("patientId1", "Edward", "", "Teach", LocalDate.of(1717, 1, 1), "123 Plank St", "", "Nassau", "NY", "12065", "(123) 456-7890", defaultOrg);
	private Patient patient3 = new Patient("patientId3", "John", "\"Long\"", "Silver", LocalDate.of(1729, 1, 1), "123 cat St", "", "lake view", "MI", "12067", "(213) 645-7890)", defaultOrg);

	// create test results
	private TestResult testResult1 = new TestResult(LocalDate.of(2020, 11, 1), device1.getId(), "positive", patient1);
	private TestResult testResult2 = new TestResult(LocalDate.of(2020, 11, 2), device1.getId(), "negative", patient1);
	private TestResult testResult3 = new TestResult(LocalDate.of(2020, 11, 3), device1.getId(), "inconclusive", patient3);

	private ArrayList<Patient> allPatients = new ArrayList<>(Arrays.asList(
		patient1,
		new Patient("patientId2", "James", "D.", "Flint", LocalDate.of(1719, 1, 1), "123 dog St", "apt 2", "Jamestown", "VT", "12068", "(321) 546-7890", defaultOrg),
		patient3,
		new Patient("patientId4","Sally","Mae","Map", LocalDate.of(1922, 1, 1),"123 bird St", "", "mountain top", "VA", "12075","(243) 635-7190", defaultOrg),
		new Patient("patientId5","Apollo","Graph","QL", LocalDate.of(1901, 1, 1),"987 Plank St", "", "town name", "CA", "15065","(243) 555-5555", defaultOrg)
	));
	public DataFetcher<List<Patient>> patientFetcher() {
		return (env) -> allPatients;
	}

	private ArrayList<TestResult> allTestResults = new ArrayList<>(Arrays.asList(
		testResult1,
		testResult2,
		testResult3
	));

	public DataFetcher<List<TestResult>> testResultFetcher() {
		return (env) -> allTestResults;
	}

	public  DataFetcher<User> userFetcher() {
		return (env) -> defaultUser;
	}

	public String addPatient(
		String patientId,
		String firstName,
		String middleName,
		String lastName,
		String birthDate,
		String street,
		String streetTwo,
		String city,
		String state,
		String zipCode,
		String phone
	) {
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");		 
		LocalDate localBirthDateDate = LocalDate.parse(birthDate, dateTimeFormatter);

		Patient newPatient = new Patient(
			patientId,
			firstName,
			middleName,
			lastName,
			localBirthDateDate,
			street,
			streetTwo,
			city,
			state,
			zipCode,
			phone,
			defaultOrg
		);
		allPatients.add(newPatient);
		return newPatient.getId();
	}

	public String updateOrganization(
		String testingFacilityName,
		String cliaNumber,
		String orderingProviderName,
		String orderingProviderNPI,
		String orderingProviderStreet,
		String orderingProviderStreetTwo,
		String orderingProviderCity,
		String orderingProviderCounty,
		String orderingProviderState,
		String orderingProviderZipCode,
		String orderingProviderPhone,
		ArrayList<String> deviceIds
	) {
		ArrayList<Device> newDevices = new ArrayList<Device>();

		deviceIds.forEach((id) -> {
			Device device = allDevices.stream().filter(d -> id.equals(d.getId())).findAny().orElse(null);
			if (device != null) {
				newDevices.add(device);
			}
		});

		defaultOrg.updateOrg(
			testingFacilityName,
			cliaNumber,
			orderingProviderName,
			orderingProviderNPI,
			orderingProviderStreet,
			orderingProviderStreetTwo,
			orderingProviderCity,
			orderingProviderCounty,
			orderingProviderState,
			orderingProviderZipCode,
			orderingProviderPhone,
			newDevices
		);
		return defaultOrg.getId();
	}

	public void init_relations() {
		patient1.setTestResults(new ArrayList<>(Arrays.asList(testResult1, testResult2)));
		patient3.setTestResults(new ArrayList<>(Arrays.asList(testResult3)));
	}
}
