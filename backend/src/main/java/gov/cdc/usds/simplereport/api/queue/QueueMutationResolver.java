package gov.cdc.usds.simplereport.api.queue;

import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import com.google.i18n.phonenumbers.NumberParseException;
import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import org.json.JSONException;
import org.springframework.stereotype.Component;

/** Mutations for creating and updating test queue entries. */
@Component
public class QueueMutationResolver implements GraphQLMutationResolver {

  private final TestOrderService _tos;
  private final PersonService _ps;

  public QueueMutationResolver(TestOrderService tos, PersonService ps) {
    _tos = tos;
    _ps = ps;
  }

  public AddTestResultResponse addTestResultNew(
      String deviceID, String result, UUID patientID, Date dateTested) throws NumberParseException {
    return _tos.addTestResult(deviceID, TestResult.valueOf(result), patientID, dateTested);
  }

  public ApiTestOrder addTestResult(String deviceID, String result, UUID patientID, Date dateTested)
      throws NumberParseException {
    return _tos.addTestResult(deviceID, TestResult.valueOf(result), patientID, dateTested)
        .getTestResult();
  }

  public ApiTestOrder editQueueItem(UUID id, String deviceId, String result, Date dateTested) {
    return new ApiTestOrder(_tos.editQueueItem(id, deviceId, result, dateTested));
  }

  public String addPatientToQueue(
      UUID facilityID,
      UUID patientID,
      String pregnancy,
      String symptoms,
      boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      String priorTestResult,
      LocalDate symptomOnset,
      boolean noSymptoms,
      TestResultDeliveryPreference testResultDelivery)
      throws JSONException {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    TestOrder to =
        _tos.addPatientToQueue(
            facilityID,
            _ps.getPatientNoPermissionsCheck(patientID),
            pregnancy,
            symptomsMap,
            firstTest,
            priorTestDate,
            priorTestType,
            (priorTestResult == null) ? null : TestResult.valueOf(priorTestResult),
            symptomOnset,
            noSymptoms);

    _ps.updateTestResultDeliveryPreference(patientID, testResultDelivery);

    return to.getPatientLink().getInternalId().toString();
  }

  public void removePatientFromQueue(UUID patientID) {
    _tos.removePatientFromQueue(patientID);
  }

  public void updateTimeOfTestQuestions(
      UUID patientID,
      String pregnancy,
      String symptoms,
      boolean firstTest,
      LocalDate priorTestDate,
      String priorTestType,
      String priorTestResult,
      LocalDate symptomOnset,
      boolean noSymptoms,
      TestResultDeliveryPreference testResultDelivery) {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    _tos.updateTimeOfTestQuestions(
        patientID,
        pregnancy,
        symptomsMap,
        firstTest,
        priorTestDate,
        priorTestType,
        priorTestResult == null ? null : TestResult.valueOf(priorTestResult),
        symptomOnset,
        noSymptoms);

    _ps.updateTestResultDeliveryPreference(patientID, testResultDelivery);
  }
}
