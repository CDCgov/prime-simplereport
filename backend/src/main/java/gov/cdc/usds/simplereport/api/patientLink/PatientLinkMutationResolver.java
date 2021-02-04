package gov.cdc.usds.simplereport.api.patientLink;

import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;
import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;
import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;

@Component
public class PatientLinkMutationResolver implements GraphQLMutationResolver {

    @Autowired
    private PatientLinkService pls;

    @Autowired
    private TestOrderService tos;

    @Autowired
    private PersonService ps;

    @Value("${feature-flags.patient-links:false}")
    private boolean patientLinksEnabled;

    public PatientLink refreshPatientLink(String internalId) {
        return pls.refreshPatientLink(internalId);
    }

    public String patientLinkSubmit(String internalId, String birthDate, String pregnancy, String symptoms,
            boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset,
            boolean noSymptoms) throws Exception {
        if (!patientLinksEnabled) {
            throw new Exception("Patient links not enabled");
        }
        Person patient = pls.getPatientLinkVerify(internalId, birthDate);
        String patientId = patient.getInternalId().toString();
        LocalDate localPriorTestDate = parseUserDate(priorTestDate);
        LocalDate localSymptomOnset = parseUserDate(symptomOnset);

        Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

        tos.updateTimeOfTestQuestions(patientId, pregnancy, symptomsMap, firstTest, localPriorTestDate, priorTestType,
                priorTestResult == null ? null : TestResult.valueOf(priorTestResult), localSymptomOnset, noSymptoms);
        return "success";
    }

    public Person patientLinkUpdatePatient(String internalId, String oldBirthDate, String lookupId, String firstName,
            String middleName, String lastName, String suffix, String newBirthDate, String street, String street2,
            String city, String state, String zipCode, String telephone, String role, String email, String county,
            String race, String ethnicity, String gender, Boolean residentCongregateSetting,
            Boolean employedInHealthcare) throws Exception {
        PatientLink pl = pls.getPatientLink(internalId);
        UUID facilityId = pl.getTestOrder().getFacility().getInternalId();
        Person patient = pls.getPatientLinkVerify(internalId, oldBirthDate);
        String patientId = patient.getInternalId().toString();
        return ps.updatePatient(facilityId, patientId, parseString(lookupId), parseString(firstName),
                parseString(middleName), parseString(lastName), parseString(suffix), parseUserDate(newBirthDate),
                parseString(street), parseString(street2), parseString(city), parseState(state), parseString(zipCode),
                parsePhoneNumber(telephone), parsePersonRole(role), parseEmail(email), parseString(county),
                parseRace(race), parseEthnicity(ethnicity), parseGender(gender), residentCongregateSetting,
                employedInHealthcare);
    }

}
