package gov.cdc.usds.simplereport.api.patientLink;

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

    public PatientLink refreshPatientLink(String internalId) {
        return pls.refreshPatientLink(internalId);
    }

    public String patientLinkSubmit(String internalId, LocalDate birthDate, String pregnancy, String symptoms,
            boolean firstTest, LocalDate priorTestDate, String priorTestType, String priorTestResult,
            LocalDate symptomOnset, boolean noSymptoms) throws Exception {
        Person patient = pls.getPatientLinkVerify(internalId, birthDate);
        String patientID = patient.getInternalId().toString();

        Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

        tos.updateTimeOfTestQuestions(patientID, pregnancy, symptomsMap, firstTest, priorTestDate, priorTestType,
                priorTestResult == null ? null : TestResult.valueOf(priorTestResult), symptomOnset, noSymptoms);
        return "success";
    }

    public Person patientLinkUpdatePatient(String internalId, LocalDate oldBirthDate, String lookupId, String firstName,
            String middleName, String lastName, String suffix, LocalDate newBirthDate, String street, String street2,
            String city, String state, String zipCode, String telephone, String role, String email, String county,
            String race, String ethnicity, String gender, Boolean residentCongregateSetting,
            Boolean employedInHealthcare) throws Exception {
        PatientLink pl = pls.getPatientLink(internalId);
        UUID facilityId = pl.getTestOrder().getFacility().getInternalId();
        Person patient = pls.getPatientLinkVerify(internalId, oldBirthDate);
        String patientId = patient.getInternalId().toString();
        return ps.updatePatient(facilityId, patientId, parseString(lookupId), parseString(firstName),
                parseString(middleName), parseString(lastName), parseString(suffix), newBirthDate, parseString(street),
                parseString(street2), parseString(city), parseState(state), parseString(zipCode),
                parsePhoneNumber(telephone), parsePersonRole(role), parseEmail(email), parseString(county),
                parseRace(race), parseEthnicity(ethnicity), parseGender(gender), residentCongregateSetting,
                employedInHealthcare);
    }

}
