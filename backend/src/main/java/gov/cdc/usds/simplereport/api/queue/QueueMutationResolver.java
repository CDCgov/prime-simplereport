package gov.cdc.usds.simplereport.api.queue;

import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;
import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.Date;

import org.json.JSONException;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import static gov.cdc.usds.simplereport.api.Translators.parseUserDateTime;

/**
 * Mutations for creating and updating test queue entries.
 */
@Component
public class QueueMutationResolver implements GraphQLMutationResolver {

  private final TestOrderService _tos;
  private final PersonService _ps;

  public QueueMutationResolver(TestOrderService tos, PersonService ps) {
    _tos = tos;
    _ps = ps;
  }

  public void addTestResult(String deviceID, String result, String patientID, String dateTested) {
    Date isoDate = parseUserDateTime(dateTested);
    _tos.addTestResult(deviceID, TestResult.valueOf(result), patientID, isoDate);
  }

  public ApiTestOrder editQueueItem(String id, String deviceId, String result, String dateTested) {
    Date isoDate = parseUserDateTime(dateTested);
    return new ApiTestOrder(_tos.editQueueItem(id, deviceId, result, isoDate));
  }

  public String addPatientToQueue(String facilityID, String patientID, String pregnancy, String symptoms,
      boolean firstTest, String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset,
      boolean noSymptoms) throws JSONException {
    LocalDate localPriorTestDate = parseUserDate(priorTestDate);
    LocalDate localSymptomOnset = parseUserDate(symptomOnset);

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    TestOrder to = _tos.addPatientToQueue(UUID.fromString(facilityID), _ps.getPatient(patientID), pregnancy,
        symptomsMap, firstTest, localPriorTestDate, priorTestType,
        (priorTestResult == null) ? null : TestResult.valueOf(priorTestResult), localSymptomOnset, noSymptoms);

    return to.getPatientLink().getInternalId().toString();
  }

  public void removePatientFromQueue(String patientID) {
    _tos.removePatientFromQueue(patientID);
  }

  public int clearQueue() {
    return _tos.cancelAll();
  }

  public void updateTimeOfTestQuestions(String patientID, String pregnancy, String symptoms, boolean firstTest,
      String priorTestDate, String priorTestType, String priorTestResult, String symptomOnset, boolean noSymptoms) {
    LocalDate localPriorTestDate = parseUserDate(priorTestDate);
    LocalDate localSymptomOnset = parseUserDate(symptomOnset);

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    _tos.updateTimeOfTestQuestions(patientID, pregnancy, symptomsMap, firstTest, localPriorTestDate, priorTestType,
        priorTestResult == null ? null : TestResult.valueOf(priorTestResult), localSymptomOnset, noSymptoms);
  }

}