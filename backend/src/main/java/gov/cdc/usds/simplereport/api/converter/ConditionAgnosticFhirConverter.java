package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.*;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.utils.DateTimeUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Enumerations;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.ResourceType;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ConditionAgnosticFhirConverter {
  //    extract the methods we're pulling into a util object?
  private final FhirConverter fhirConverter;

  public Bundle createFhirBundle(ConditionAgnosticCreateFhirBundleProps props) {
    var bundle = new Bundle();
    return bundle;
  }

  public DiagnosticReport convertToDiagnosticReport(
      ConditionAgnosticConvertToDiagnosticReportProps props) {
    DiagnosticReport diagnosticReport = new DiagnosticReport();
    var categoryCodeableConcept = new CodeableConcept();
    var categoryCoding = categoryCodeableConcept.addCoding();
    categoryCoding.setSystem(DIAGNOSTIC_CODE_SYSTEM);
    categoryCoding.setCode("LAB");
    diagnosticReport.setCategory(List.of(categoryCodeableConcept));

    var diagnosticCodeableConcept = new CodeableConcept();
    var diagnosticCoding = diagnosticCodeableConcept.addCoding();
    diagnosticCoding.setSystem(LOINC_CODE_SYSTEM).setCode(props.getTestPerformedCode());
    diagnosticReport.setCode(diagnosticCodeableConcept);

    var patientFullUrl = ResourceType.Patient + "/" + props.getPatient().getId();
    diagnosticReport.setSubject(new Reference(patientFullUrl));

    var observationFullUrl = ResourceType.Observation + "/" + props.getObservation().getId();
    diagnosticReport.setResult(List.of(new Reference(observationFullUrl)));

    var effectiveDateTime = DateTimeUtils.convertToZonedDateTime(props.getTestEffectiveDate());
    diagnosticReport.setEffective(fhirConverter.convertToDateTimeType(effectiveDateTime));

    return diagnosticReport;
  }

  public Observation convertToObservation(ConditionAgnosticConvertToObservationProps props) {
    Observation observation = new Observation();
    setStatus(observation, props.getCorrectionStatus());

    var labCodeableConcept = new CodeableConcept();
    var labCodeableCoding = labCodeableConcept.addCoding();
    labCodeableCoding.setSystem(OBSERVATION_CATEGORY_CODE_SYSTEM);
    labCodeableCoding.setCode("laboratory");
    observation.setCategory(List.of(labCodeableConcept));

    var observationCodeableConcept = new CodeableConcept();
    var observationCoding = observationCodeableConcept.addCoding();
    observationCoding.setSystem(LOINC_CODE_SYSTEM).setCode(props.getTestPerformedCode());
    observation.setCode(observationCodeableConcept);

    var patientFullUrl = ResourceType.Patient + "/" + props.getPatient().getId();

    observation.setSubject(new Reference(patientFullUrl));
    addSNOMEDValue(props.getResultValue(), observation);

    return observation;
  }

  public Patient convertToPatient(ConditionAgnosticConvertToPatientProps props) {
    var patient = new Patient();
    patient.setId(props.getId());
    parsePotentiallyAbsentName(
        props.getFirstName(), props.getLastName(), props.getNameAbsentReason(), patient);
    patient.setGender(convertToAdministrativeGender(props.getGender()));
    return patient;
  }

  private void setStatus(Observation observation, TestCorrectionStatus correctionStatus) {
    switch (correctionStatus) {
      case ORIGINAL:
        observation.setStatus(Observation.ObservationStatus.FINAL);
        break;
      case CORRECTED:
        observation.setStatus(Observation.ObservationStatus.CORRECTED);
        break;
      case REMOVED:
        observation.setStatus(Observation.ObservationStatus.ENTEREDINERROR);
        break;
    }
  }

  private void addSNOMEDValue(String resultCode, Observation observation) {
    var valueCodeableConcept = new CodeableConcept();
    var valueCoding = valueCodeableConcept.addCoding();
    valueCoding.setSystem(SNOMED_CODE_SYSTEM);
    valueCoding.setCode(resultCode);
    observation.setValue(valueCodeableConcept);
  }

  private Patient parsePotentiallyAbsentName(
      String first, String last, String absentReason, Patient patient) {
    if (StringUtils.isNotBlank(first) && StringUtils.isNotBlank(last)) {
      var humanName = convertToHumanName(first, last);
      patient.addName(humanName);

    } else {
      patient
          .addName()
          .addExtension(
              new Extension()
                  .setUrl(DATA_ABSENT_REASON_EXTENSION_URL)
                  .setValue(new CodeableConcept().addCoding().setCode(absentReason)));
    }
    return patient;
  }

  public HumanName convertToHumanName(String first, String last) {
    var humanName = new HumanName();
    humanName.addGiven(first);
    humanName.setFamily(last);
    return humanName;
  }

  public Enumerations.AdministrativeGender convertToAdministrativeGender(String gender) {

    if (gender == null) {
      return Enumerations.AdministrativeGender.UNKNOWN;
    }

    return switch (gender.toLowerCase()) {
      case "male", "m" -> Enumerations.AdministrativeGender.MALE;
      case "female", "f" -> Enumerations.AdministrativeGender.FEMALE;
      default -> Enumerations.AdministrativeGender.UNKNOWN;
    };
  }
}
