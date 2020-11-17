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

    @PreAuthorize("hasAuthority('PDI admins')")
    public void addDevice(String deviceID, String displayName, String deviceManufacturer, String deviceModel, boolean isDefault) {
        final Device d = new Device(displayName, deviceManufacturer, deviceModel, isDefault);
//        DummyDataRepo.allDevices.add(d);
    }

    public void addPatient(String patientID, String firstName, String middleName, String lastName, LocalDate birthDate, String street, String street2, String city, String state, String zipCode, String phone) {
        repo.addPatient(patientID, firstName, middleName, lastName, birthDate.toString(), street, street2, city, state, zipCode, phone);
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
                                   List<String> devices) {
        repo.updateOrganization(testingFacilityName, cliaNumber, orderingProviderName, orderingProviderNPI, orderingProviderStreet, orderingProviderStreetTwo
                , orderingProviderCity, orderingProviderCounty, orderingProviderState, orderingProviderZipCode, orderingProviderPhone, devices);
    }

    public void addTestResult(String deviceID, String result, String patientID) {
        repo.addTestResult(deviceID, result, patientID);
    }

    public void addPatientToQueue(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult) {
        repo.addPatientToQueue(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult);
    }

    public void removePatientFromQueue(String patientID) {
        repo.removePatientFromQueue(patientID);
    }

    public void updateTimeOfTestQuestions(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult) {
        repo.updateTimeOfTestQuestions(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult);
    }

    public void updateDeviceForPatientInQueue(String patientID, String deviceId) {
        repo.updateDeviceForPatientInQueue(patientID, deviceId);
    }

    public void updateResultForPatientInQueue(String patientID, String result) {
        repo.updateResultForPatientInQueue(patientID, result);
    }
}