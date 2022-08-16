package gov.cdc.usds.simplereport.api.queue;

import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import com.google.i18n.phonenumbers.NumberParseException;
import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.json.JSONException;
import org.springframework.stereotype.Component;

/** Mutations for creating and updating test queue entries. */
@Component
public class QueueMutationResolver implements GraphQLMutationResolver {

  private final TestOrderService _tos;
  private final PersonService _ps;
  private final DeviceTypeService _dts;

  public QueueMutationResolver(TestOrderService tos, PersonService ps, DeviceTypeService dts) {
    _tos = tos;
    _ps = ps;
    _dts = dts;
  }

  private UUID getDeviceSpecimenTypeId(String deviceID, UUID deviceSpecimenType) {
    return deviceSpecimenType == null
        ? _dts.getFirstDeviceSpecimenTypeForDeviceTypeId(UUID.fromString(deviceID)).getInternalId()
        : deviceSpecimenType;
  }

  public AddTestResultResponse addTestResultNew(
      String deviceID, UUID deviceSpecimenType, String result, UUID patientID, Date dateTested)
      throws NumberParseException {
    UUID deviceSpecimenTypeId = getDeviceSpecimenTypeId(deviceID, deviceSpecimenType);

    return _tos.addTestResult(
        deviceSpecimenTypeId, TestResult.valueOf(result), patientID, dateTested);
  }

  public AddTestResultResponse addTestResultMultiplex(
      String deviceID,
      UUID deviceSpecimenType,
      List<MultiplexResultInput> results,
      UUID patientID,
      Date dateTested)
      throws NumberParseException {
    UUID deviceSpecimenTypeId = getDeviceSpecimenTypeId(deviceID, deviceSpecimenType);

    return _tos.addTestResultMultiplex(deviceSpecimenTypeId, results, patientID, dateTested);
  }

  public ApiTestOrder editQueueItem(
      UUID id, String deviceId, UUID deviceSpecimenType, String result, Date dateTested) {
    UUID dst = getDeviceSpecimenTypeId(deviceId, deviceSpecimenType);

    return new ApiTestOrder(_tos.editQueueItem(id, dst, result, dateTested));
  }

  public ApiTestOrder editQueueItemMultiplex(
      UUID id,
      String deviceId,
      UUID deviceSpecimenType,
      List<MultiplexResultInput> results,
      Date dateTested) {
    UUID dst = getDeviceSpecimenTypeId(deviceId, deviceSpecimenType);

    return new ApiTestOrder(_tos.editQueueItemMultiplex(id, dst, results, dateTested));
  }

  public String addPatientToQueue(
      UUID facilityID,
      UUID patientID,
      String pregnancy,
      String symptoms,
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
            symptomOnset,
            noSymptoms);

    _ps.updateTestResultDeliveryPreference(patientID, testResultDelivery);

    return to.getInternalId()
        .toString(); // this return is unused in the UI. it used to be PatientLinkInternalId
  }

  public void removePatientFromQueue(UUID patientID) {
    _tos.removePatientFromQueue(patientID);
  }

  public void updateTimeOfTestQuestions(
      UUID patientID,
      String pregnancy,
      String symptoms,
      LocalDate symptomOnset,
      boolean noSymptoms,
      TestResultDeliveryPreference testResultDelivery) {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    _tos.updateTimeOfTestQuestions(patientID, pregnancy, symptomsMap, symptomOnset, noSymptoms);

    _ps.updateTestResultDeliveryPreference(patientID, testResultDelivery);
  }
}
