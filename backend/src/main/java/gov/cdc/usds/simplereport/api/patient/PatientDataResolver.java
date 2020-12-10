package gov.cdc.usds.simplereport.api.patient;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.Patient;
import gov.cdc.usds.simplereport.api.model.PatientResult;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLResolver;

@Component
public class PatientDataResolver implements GraphQLResolver<Patient> {

    @Autowired
    public TestOrderService _svc;

    public List<PatientResult> getTestResults(Patient p) {
        return _svc.getTestResults(p.getWrapped()).stream()
                .map(PatientResult::new)
                .collect(Collectors.toUnmodifiableList());
    }
}
