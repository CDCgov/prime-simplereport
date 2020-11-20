package gov.cdc.usds.simplereport.api.queue;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import gov.cdc.usds.simplereport.service.PersonService; 
import gov.cdc.usds.simplereport.service.TestOrderService; 
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;
import gov.cdc.usds.simplereport.db.model.TestOrder;

import graphql.kickstart.tools.GraphQLMutationResolver;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class QueueMutationResolver implements GraphQLMutationResolver  {
    private static DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TestOrderService _tos;
    private final PersonService _ps;

    public QueueMutationResolver(TestOrderService tos, PersonService ps) {
      _tos = tos;
      _ps = ps;
    }

    public void addTestResult(String deviceID, String result, String patientID) {
      _tos.addTestResult(
        deviceID,
        TestOrder.TestResult.valueOf(result),
        patientID
      );
    }

    public void addPatientToQueue(
        String patientID,
        String pregnancy,
        String symptoms,
        boolean firstTest,
        String priorTestDate,
        String priorTestType,
        String priorTestResult,
        String symptomOnset,
        boolean noSymptoms
    ) {
      _tos.addPatientToQueue(
        _ps.getPatient(patientID)
        // pregnancy,
        // symptoms,
        // firstTest,
        // priorTestDate,
        // priorTestType,
        // priorTestResult,
        // symptomOnset,
        // noSymptoms
      );
    }

    public void removePatientFromQueue(String patientID) {
      _tos.removePatientFromQueue(patientID);
    }

    public void updateTimeOfTestQuestions(String patientID, String pregnancy, String symptoms, boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset, boolean noSymptoms) {
      // TODO 
      // repo.updateTimeOfTestQuestions(patientID, pregnancy, symptoms, firstTest, priorTestDate, priorTestType, priorTestResult, symptomOnset, noSymptoms);
    }

}