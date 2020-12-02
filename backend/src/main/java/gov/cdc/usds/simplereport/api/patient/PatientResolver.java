package gov.cdc.usds.simplereport.api.patient;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import graphql.kickstart.tools.GraphQLQueryResolver;

import gov.cdc.usds.simplereport.api.model.Patient;
import gov.cdc.usds.simplereport.service.PersonService;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class PatientResolver implements GraphQLQueryResolver {

	@Autowired
	private PersonService ps;

	public List<Patient> getPatients() {
		return ps.getPatients().stream()
		.map(p -> new Patient(p))
		.collect(Collectors.toList());
	}

	public Patient getPatient(String id) {
		return new Patient(ps.getPatient(id));
	}
}
