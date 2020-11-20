package gov.cdc.usds.simplereport.api.queue;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONObject;
import org.json.JSONException;
import java.util.Iterator;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.PersonService; 
import gov.cdc.usds.simplereport.service.TestOrderService; 
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

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
        TestResult.valueOf(result),
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
    ) throws JSONException {
      LocalDate localPriorTestDate = (priorTestDate == null) ? null : LocalDate.parse(priorTestDate, this.dateTimeFormatter);
      LocalDate localSymptomOnset = (symptomOnset == null) ? null : LocalDate.parse(symptomOnset, this.dateTimeFormatter);

      Map<String, Boolean> symptomsMap = new HashMap<String, Boolean>();
      JSONObject symptomsJSONObject = new JSONObject(symptoms);
      Iterator<?> keys = symptomsJSONObject.keys();
      while(keys.hasNext() ){
          String key = (String)keys.next();
          Boolean value = symptomsJSONObject.getBoolean(key); 
          symptomsMap.put(key, value);
      }

      _tos.addPatientToQueue(
        _ps.getPatient(patientID),
        pregnancy,
        symptomsMap,
        firstTest,
        localPriorTestDate,
        priorTestType,
        TestResult.valueOf(priorTestResult),
        localSymptomOnset,
        noSymptoms
      );
    }

    public void removePatientFromQueue(String patientID) {
      _tos.removePatientFromQueue(patientID);
    }

    public void updateTimeOfTestQuestions(
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
      LocalDate localPriorTestDate = (priorTestDate == null) ? null : LocalDate.parse(priorTestDate, this.dateTimeFormatter);
      LocalDate localSymptomOnset = (symptomOnset == null) ? null : LocalDate.parse(symptomOnset, this.dateTimeFormatter);

      Map<String, Boolean> symptomsMap = new HashMap<String, Boolean>();
      JSONObject symptomsJSONObject = new JSONObject(symptoms);
      Iterator<?> keys = symptomsJSONObject.keys();
      while(keys.hasNext() ){
          String key = (String)keys.next();
          Boolean value = symptomsJSONObject.getBoolean(key); 
          symptomsMap.put(key, value);
      }

      _tos.updateTimeOfTestQuestions(
        patientID,
        pregnancy,
        symptomsMap,
        firstTest,
        localPriorTestDate,
        priorTestType,
        TestResult.valueOf(priorTestResult),
        localSymptomOnset,
        noSymptoms
      );
    }

}