package gov.cdc.usds.simplereport.api;

import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

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
