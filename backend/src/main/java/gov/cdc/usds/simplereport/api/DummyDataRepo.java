package gov.cdc.usds.simplereport.api;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Repository;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Patient;
import graphql.schema.DataFetcher;

@Repository
public class DummyDataRepo {

	private static final ArrayList<Patient> allPatients = new ArrayList<>(Arrays.asList(
		new Patient("patientId1", "Edward", "", "Teach", LocalDate.of(1717, 1, 1),
			"123 Plank St, Nassau", "(123) 456-7890"),
		new Patient("patientId2", "James", "D.", "Flint", LocalDate.of(1719, 1, 1), "456 Plank St, Nassau", "(321) 546-7890"),
		new Patient("patientId3", "John", "\"Long\"", "Silver", LocalDate.of(1722, 1, 1), "789 Plank St, Nassau", "(213) 645-7890)"),
		new Patient("patientId4","Sally","Mae","Map",LocalDate.of(1922, 1, 1),"789 Road St, Nassau","(243) 635-7190"),
		new Patient("patientId5","Apollo","Graph","QL",LocalDate.of(1901, 1, 1),"411 Test Highway","(243) 555-5555")
	));

	private static final ArrayList<Device> allDevices = new ArrayList<>(Arrays.asList(
			new Device("deviceId2","BD Veritor","BD","Veritor", true),
			new Device("deviceId3","Abbott Binax Now","Abbott","Binax Now",false),
			new Device("graphQLTest","Does GraphQL Work","Apollo","GraphQL",false)
	));

	public static final DataFetcher<List<Patient>> patientFetcher() {
		return (env) -> Collections.unmodifiableList(allPatients);
	}

	public static final DataFetcher<List<Device>> deviceFetcher() {
		return (env) -> Collections.unmodifiableList(allDevices);
	}

	public static void addDevice(Device d) {
		allDevices.add(d);
	}

	public static void addPatient(Patient patient) {
		allPatients.add(patient);
	}
}
