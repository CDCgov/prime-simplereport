package gov.cdc.usds.simplereport.api.queue;

import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.json.JSONException;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

/** Mutations for creating and updating test queue entries. */
@Controller
@RequiredArgsConstructor
public class QueueMutationResolver {

  private final TestOrderService testOrderService;
  private final PersonService personService;

  @MutationMapping
  public AddTestResultResponse submitQueueItem(
      @Argument UUID deviceTypeId,
      @Argument UUID specimenTypeId,
      @Argument List<MultiplexResultInput> results,
      @Argument UUID patientId,
      @Argument Date dateTested) {
    return testOrderService.addMultiplexResult(
        deviceTypeId, specimenTypeId, results, patientId, dateTested);
  }

  @MutationMapping
  public ApiTestOrder editQueueItem(
      @Argument UUID id,
      @Argument UUID deviceTypeId,
      @Argument UUID specimenTypeId,
      @Argument List<MultiplexResultInput> results,
      @Argument Date dateTested) {
    return new ApiTestOrder(
        testOrderService.editQueueItemMultiplexResult(
            id, deviceTypeId, specimenTypeId, results, dateTested));
  }

  @MutationMapping
  public String addPatientToQueue(
      @Argument UUID facilityId,
      @Argument UUID patientId,
      @Argument String pregnancy,
      @Argument String syphilisHistory,
      @Argument String symptoms,
      @Argument LocalDate symptomOnset,
      @Argument Boolean noSymptoms,
      @Argument TestResultDeliveryPreference testResultDelivery)
      throws JSONException {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    TestOrder to =
        testOrderService.addPatientToQueue(
            facilityId,
            personService.getPatientNoPermissionsCheck(patientId),
            pregnancy,
            syphilisHistory,
            symptomsMap,
            symptomOnset,
            noSymptoms);

    if (testResultDelivery != null) {
      personService.updateTestResultDeliveryPreference(patientId, testResultDelivery);
    }

    return to.getInternalId()
        .toString(); // this return is unused in the UI. it used to be PatientLinkInternalId
  }

  @MutationMapping
  public void removePatientFromQueue(@Argument UUID patientId) {
    testOrderService.removePatientFromQueue(patientId);
  }

  @MutationMapping
  public void updateAoeQuestions(
      @Argument UUID patientId,
      @Argument String pregnancy,
      @Argument String syphilisHistory,
      @Argument String symptoms,
      @Argument LocalDate symptomOnset,
      @Argument Boolean noSymptoms,
      @Argument List<String> genderOfSexualPartners,
      @Argument TestResultDeliveryPreference testResultDelivery) {

    Map<String, Boolean> symptomsMap = parseSymptoms(symptoms);

    testOrderService.updateAoeQuestions(
        patientId,
        pregnancy,
        syphilisHistory,
        symptomsMap,
        symptomOnset,
        noSymptoms,
        genderOfSexualPartners);

    if (testResultDelivery != null) {
      personService.updateTestResultDeliveryPreference(patientId, testResultDelivery);
    }
  }
}
