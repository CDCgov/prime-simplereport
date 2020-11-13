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

	private static final ArrayList<Patient> allPatients = new ArrayList<>(Arrays.asList(
		new Patient("patientId1", "Edward", "", "Teach", LocalDate.of(1717, 1, 1),
			"123 Plank St", "", "Nassau", "NY", "12065", "(123) 456-7890", new TestResult(LocalDate.of(2020, 11, 1))),
		new Patient("patientId2", "James", "D.", "Flint", LocalDate.of(1719, 1, 1), "123 dog St", "apt 2", "Jamestown", "VT", "12068", "(321) 546-7890", new TestResult(LocalDate.of(2020, 11, 3))),
		new Patient("patientId3", "John", "\"Long\"", "Silver", LocalDate.of(1722, 1, 1), "123 cat St", "", "lake view", "MI", "12067", "(213) 645-7890)"),
		new Patient("patientId4","Sally","Mae","Map",LocalDate.of(1922, 1, 1),"123 bird St", "", "mountain top", "VA", "12075","(243) 635-7190"),
		new Patient("patientId5","Apollo","Graph","QL",LocalDate.of(1901, 1, 1),"987 Plank St", "", "town name", "CA", "15065","(243) 555-5555")
	));

	private static final User user = new User(
		new Organization(
			"","","","", "", "", "", "", "", "", "",
			new ArrayList<>(Arrays.asList(
				new Device("BD Veritor","BD","Veritor", true),
				new Device("Abbott Binax Now","Abbott","Binax Now",false),
				new Device("Does GraphQL Work","Apollo","GraphQL",false)
			))
		)
	);

	public static final DataFetcher<List<Patient>> patientFetcher() {
		return (env) -> Collections.unmodifiableList(allPatients);
	}

	public static final DataFetcher<User> userFetcher() {
		return (env) -> user;
	}

	public static void addPatient(Patient patient) {
		allPatients.add(patient);
	}
}
