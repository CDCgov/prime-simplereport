package gov.cdc.usds.simplereport.api.queue;

import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import com.google.i18n.phonenumbers.NumberParseException;
import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.json.JSONException;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

/** Mutations for creating and updating test queue entries. */
@Controller
public class QueueMutationResolver {

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

  @MutationMapping
  public AddTestResultResponse addMultiplexResult(
      @Argument String deviceId,
      @Argument UUID deviceSpecimenType,
      @Argument List<MultiplexResultInput> results,
      @Argument UUID patientId,
      @Argument Date dateTested)
      throws NumberParseException {
    UUID deviceSpecimenTypeId = getDeviceSpecimenTypeId(deviceId, deviceSpecimenType);

    return _tos.addMultiplexResult(deviceSpecimenTypeId, results, patientId, dateTested);
  }

  @MutationMapping
  public ApiTestOrder editQueueItemMultiplexResult(
      @Argument UUID id,
      @Argument String deviceId,
      @Argument UUID deviceSpecimenType,
      @Argument List<MultiplexResultInput> results,
      @Argument Date dateTested) {
    UUID dst = getDeviceSpecimenTypeId(deviceId, deviceSpecimenType);

    return new ApiTestOrder(_tos.editQueueItemMultiplexResult(id, dst, results, dateTested));
  }

  @MutationMapping
  public String addPatientToQueue(
      @Argument UUID facilityId,
      @Argument UUID patientId,
      @Argument String pregnancy,
      @Argument String symptoms,
      @Argument LocalDate symptomOnset,
      @Argument Boolean noSymptoms,
      @Argument TestResultDeliveryPreference testResultDelivery)
      throws JSONException {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    TestOrder to =
        _tos.addPatientToQueue(
            facilityId,
            _ps.getPatientNoPermissionsCheck(patientId),
            pregnancy,
            symptomsMap,
            symptomOnset,
            noSymptoms);

    _ps.updateTestResultDeliveryPreference(patientId, testResultDelivery);

    return to.getInternalId()
        .toString(); // this return is unused in the UI. it used to be PatientLinkInternalId
  }

  @MutationMapping
  public void removePatientFromQueue(@Argument UUID patientId) {
    _tos.removePatientFromQueue(patientId);
  }

  @MutationMapping
  public void updateTimeOfTestQuestions(
      @Argument UUID patientId,
      @Argument String pregnancy,
      @Argument String symptoms,
      @Argument LocalDate symptomOnset,
      @Argument Boolean noSymptoms,
      @Argument TestResultDeliveryPreference testResultDelivery) {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    _tos.updateTimeOfTestQuestions(patientId, pregnancy, symptomsMap, symptomOnset, noSymptoms);

    _ps.updateTestResultDeliveryPreference(patientId, testResultDelivery);
  }
}
