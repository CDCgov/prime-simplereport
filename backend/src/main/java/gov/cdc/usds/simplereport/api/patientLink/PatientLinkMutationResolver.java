package gov.cdc.usds.simplereport.api.patientLink;

import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;
import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;

@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {

    @Autowired
    private PatientLinkService pls;

    @Autowired
    private TestOrderService tos;

    public PatientLink refreshPatientLink(String internalId) {
        return pls.refreshPatientLink(internalId);
    }

    public String patientLinkSubmit(String internalId, String birthDate, String pregnancy, String symptoms,
            boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset,
            boolean noSymptoms) throws Exception {
        Person patient = pls.getPatientLinkVerify(internalId, birthDate);
        String patientID = patient.getInternalId().toString();
        LocalDate localPriorTestDate = parseUserDate(priorTestDate);
        LocalDate localSymptomOnset = parseUserDate(symptomOnset);

        Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

        tos.updateTimeOfTestQuestions(patientID, pregnancy, symptomsMap, firstTest, localPriorTestDate, priorTestType,
                priorTestResult == null ? null : TestResult.valueOf(priorTestResult), localSymptomOnset, noSymptoms);
        return "success";
    }

}
