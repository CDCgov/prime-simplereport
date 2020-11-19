package gov.cdc.usds.simplereport.api;

import org.springframework.stereotype.Component;

import graphql.kickstart.tools.GraphQLMutationResolver;

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

    public void addPatientToQueue(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset, boolean noSymptoms) {
        repo.addPatientToQueue(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult, symptomOnset, noSymptoms);
    }

    public void removePatientFromQueue(String patientID) {
        repo.removePatientFromQueue(patientID);
    }

    public void updateTimeOfTestQuestions(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset, boolean noSymptoms) {
        repo.updateTimeOfTestQuestions(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult, symptomOnset, noSymptoms);
    }
}