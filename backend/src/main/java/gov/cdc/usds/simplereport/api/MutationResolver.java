package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.api.model.Device;
import gov.cdc.usds.simplereport.api.model.Organization;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class MutationResolver implements GraphQLMutationResolver {

    private final DummyDataRepo repo;

    public MutationResolver(DummyDataRepo repo) {
        this.repo = repo;
    }

    // @PreAuthorize("hasAuthority('PDI admins')")

    public void addPatient(
        String lookupId,
        String firstName,
        String middleName,
        String lastName,
        String birthDate,
        String street,
        String street2,
        String city,
        String state,
        String zipCode,
        String phone,
        String typeOfHealthcareProfessional,
        String email,
        String county,
        String race,
        String ethnicity,
        String gender,
        Boolean residentCongregateSetting,
        Boolean employedInHealthcare
    ) {
        repo.addPatient(
            lookupId,
            firstName,
            middleName,
            lastName,
            birthDate,
            street,
            street2,
            city,
            state,
            zipCode,
            phone,
            typeOfHealthcareProfessional,
            email,
            county,
            race,
            ethnicity,
            gender,
            residentCongregateSetting,
            employedInHealthcare
        );
    }

    public void updateOrganization(String testingFacilityName,
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
                                   List<String> devices,
                                   String defaultDevice) {
        repo.updateOrganization(testingFacilityName, cliaNumber, orderingProviderName, orderingProviderNPI, orderingProviderStreet, orderingProviderStreetTwo
                , orderingProviderCity, orderingProviderCounty, orderingProviderState, orderingProviderZipCode, orderingProviderPhone, devices, defaultDevice);
    }

    public void addTestResult(String deviceID, String result, String patientID) {
        repo.addTestResult(deviceID, result, patientID);
    }

    public void addPatientToQueue(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset, boolean noSymptoms) {
        repo.addPatientToQueue(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult, symptomOnset, noSymptoms);
    }

    public void removePatientFromQueue(String patientID) {
        repo.removePatientFromQueue(patientID);
    }

    public void updateTimeOfTestQuestions(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset, boolean noSymptoms) {
        repo.updateTimeOfTestQuestions(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult, symptomOnset, noSymptoms);
    }

    public void updateDeviceForPatientInQueue(String patientID, String deviceId) {
        repo.updateDeviceForPatientInQueue(patientID, deviceId);
    }

    public void updateResultForPatientInQueue(String patientID, String result) {
        repo.updateResultForPatientInQueue(patientID, result);
    }
}