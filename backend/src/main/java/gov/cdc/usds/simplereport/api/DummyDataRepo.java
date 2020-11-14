package gov.cdc.usds.simplereport.api;

import java.time.LocalDate;
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

	private Device device1 =  new Device("Quidel Sofia 2","Quidel","Sofia 2", true);

	private ArrayList<Device> allDevices = new ArrayList<>(Arrays.asList(
		device1,
		new Device("BD Veritor","BD","Veritor", true),
		new Device("Abbott Binax Now","Abbott","Binax Now",false),
		new Device("Abbott IDNow","Abbott","IDNow",false),
		new Device("LumiraDX","LumiraDX","",false)
	));

	private Organization defaultOrg = new Organization("","","","", "", "", "", "", "", "", "", allDevices);
	private User defaultUser = new User(defaultOrg);

	private ArrayList<Organization> allOrganizations = new ArrayList<>(Arrays.asList(defaultOrg));


	
	
	private Patient patient1 = new Patient("patientId1", "Edward", "", "Teach", LocalDate.of(1717, 1, 1), "123 Plank St", "", "Nassau", "NY", "12065", "(123) 456-7890");
	private Patient patient3 = new Patient("patientId3", "John", "\"Long\"", "Silver", LocalDate.of(1729, 1, 1), "123 cat St", "", "lake view", "MI", "12067", "(213) 645-7890)");
	private ArrayList<Patient> allPatients = new ArrayList<>(Arrays.asList(
		patient1,
		new Patient("patientId2", "James", "D.", "Flint", LocalDate.of(1719, 1, 1), "123 dog St", "apt 2", "Jamestown", "VT", "12068", "(321) 546-7890"),
		patient3,
		new Patient("patientId4","Sally","Mae","Map", LocalDate.of(1922, 1, 1),"123 bird St", "", "mountain top", "VA", "12075","(243) 635-7190"),
		new Patient("patientId5","Apollo","Graph","QL", LocalDate.of(1901, 1, 1),"987 Plank St", "", "town name", "CA", "15065","(243) 555-5555")
	));

	private TestResult testResult1 = new TestResult(LocalDate.of(2020, 11, 1), device1.getId(), "positive", patient1.getId());
	private TestResult testResult2 = new TestResult(LocalDate.of(2020, 11, 2), device1.getId(), "negative", patient1.getId());
	private TestResult testResult3 = new TestResult(LocalDate.of(2020, 11, 3), device1.getId(), "inconclusive", patient3.getId());
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

	public String addDevice(String displayName, String deviceManufacturer, String deviceModel, Boolean isDefault) {
		Device newDevice = new Device(displayName, deviceManufacturer, deviceModel, isDefault);
		allDevices.add(newDevice);
		return newDevice.getId();
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
}
