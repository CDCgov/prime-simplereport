package gov.cdc.usds.simplereport.api.queue;

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

  public void addTestResult(String deviceID, String result, String patientID, Date dateTested) {
      _tos.addTestResult(deviceID, TestResult.valueOf(result), patientID, dateTested);
  }

  public ApiTestOrder editQueueItem(String id, String deviceId, String result, Date dateTested) {
      return new ApiTestOrder(_tos.editQueueItem(id, deviceId, result, dateTested));
  }

  public String addPatientToQueue(String facilityID, String patientID, String pregnancy, String symptoms,
          boolean firstTest, LocalDate priorTestDate, String priorTestType, String priorTestResult,
          LocalDate symptomOnset,
      boolean noSymptoms) throws JSONException {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    TestOrder to = _tos.addPatientToQueue(UUID.fromString(facilityID), _ps.getPatientNoPermissionsCheck(patientID),
        pregnancy, symptomsMap, firstTest, priorTestDate, priorTestType,
        (priorTestResult == null) ? null : TestResult.valueOf(priorTestResult), symptomOnset, noSymptoms);

    return to.getPatientLink().getInternalId().toString();
  }

  public void removePatientFromQueue(String patientID) {
    _tos.removePatientFromQueue(patientID);
  }

  public int clearQueue() {
    return _tos.cancelAll();
  }

  public void updateTimeOfTestQuestions(String patientID, String pregnancy, String symptoms, boolean firstTest,
          LocalDate priorTestDate, String priorTestType, String priorTestResult, LocalDate symptomOnset,
          boolean noSymptoms) {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    _tos.updateTimeOfTestQuestions(patientID, pregnancy, symptomsMap, firstTest, priorTestDate, priorTestType,
        priorTestResult == null ? null : TestResult.valueOf(priorTestResult), symptomOnset, noSymptoms);
  }

}