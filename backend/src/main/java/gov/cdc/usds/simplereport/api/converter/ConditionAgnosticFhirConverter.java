package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.*;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.SIMPLE_REPORT_ORG_ID;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.DateTimeUtils;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Enumerations;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.InstantType;
import org.hl7.fhir.r4.model.MessageHeader;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.Resource;
import org.hl7.fhir.r4.model.ResourceType;
import org.hl7.fhir.r4.model.StringType;
import org.springframework.boot.info.GitProperties;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ConditionAgnosticFhirConverter {
  //    extract the methods we're pulling into a util object?
  private final FhirConverter fhirConverter;
  private final UUIDGenerator uuidGenerator;

  public Bundle createFhirBundle(ConditionAgnosticCreateFhirBundleProps props) {

    var patientFullUrl = ResourceType.Patient + "/" + props.getPatient().getId();

    // QUESTION: these ID's don't exist within the spec. Should we be generating them internally
    // somehow?
    var diagnosticReportFullUrl = ResourceType.Patient + "/" + props.getDiagnosticReport().getId();

    var messageHeader =
        createMessageHeader(
            diagnosticReportFullUrl, props.getGitProperties(), props.getProcessingId());
    var messageHeaderFullUrl = ResourceType.MessageHeader + "/" + messageHeader.getId();

    // QUESTION: other FHIR converter has this concept of a service request. Do we need this for the
    // condition
    // agnostic bundle as well?
    // props.getDiagnosticReport().addBasedOn(new Reference(serviceRequestFullUrl));
    props.getDiagnosticReport().setSubject(new Reference(patientFullUrl));

    var entryList = new ArrayList<Pair<String, Resource>>();
    entryList.add(Pair.of(messageHeaderFullUrl, messageHeader));
    entryList.add(Pair.of(diagnosticReportFullUrl, props.getDiagnosticReport()));
    entryList.add(Pair.of(patientFullUrl, props.getPatient()));
    entryList.add(
        Pair.of(
            ResourceType.Organization + "/" + SIMPLE_REPORT_ORG_ID,
            new Organization().setName("SimpleReport").setId(SIMPLE_REPORT_ORG_ID)));

    // QUESTION: the other FHIR converter is passing in these observations in a list, but I was
    // assuming
    // that for a CSV file, we'd only have the one observation per row. Are there multiple
    // observations per
    // row within a CSV?
    Observation observation = props.getObservation();
    // QUESTION: these ID's don't exist within the spec. Should we be generating them internally
    // somehow?
    var observationFullUrl = ResourceType.Observation + "/" + observation.getId();
    observation.setSubject(new Reference(patientFullUrl));
    props.getDiagnosticReport().addResult(new Reference(observationFullUrl));
    entryList.add(Pair.of(observationFullUrl, observation));

    Date curDate = new DateGenerator().newDate();
    var bundle =
        new Bundle()
            .setType(Bundle.BundleType.MESSAGE)
            .setTimestamp(curDate)
            .setIdentifier(new Identifier().setValue(props.getDiagnosticReport().getId()));

    entryList.forEach(
        pair ->
            bundle.addEntry(
                new Bundle.BundleEntryComponent()
                    .setFullUrl(pair.getFirst())
                    .setResource(pair.getSecond())));

    return bundle;
  }

  public MessageHeader createMessageHeader(
      String mainResourceUrl, GitProperties gitProperties, String processingId) {
    var messageHeader = new MessageHeader();
    UUID messageHeaderId = uuidGenerator.randomUUID();
    messageHeader.setId(messageHeaderId.toString());
    messageHeader
        .getEventCoding()
        .setSystem(EVENT_TYPE_CODE_SYSTEM)
        .setCode(EVENT_TYPE_CODE)
        .setDisplay(EVENT_TYPE_DISPLAY);
    messageHeader
        .getSource()
        .setSoftware("PRIME SimpleReport")
        .setEndpoint("https://simplereport.gov")
        .setVersion(gitProperties.getShortCommitId());
    messageHeader
        .addDestination()
        .setName("PRIME ReportStream")
        .setEndpoint("https://prime.cdc.gov/api/reports?option=SkipInvalidItems");
    //        QUESTION: // this doesn't exist: should we replace it with something?
    //        messageHeader.getSender().setReferenceElement(new StringType(organizationUrl));
    //        // provenance within the test result uploader relies on organization ID. Should this
    // get replaced with something?
    //        QUESTION: messageHeader.addFocus(new Reference(provenanceFullUrl));
    messageHeader.addFocus(new Reference(mainResourceUrl));
    messageHeader
        .getSource()
        .addExtension()
        .setUrl("https://reportstream.cdc.gov/fhir/StructureDefinition/software-binary-id")
        .setValue(new StringType(gitProperties.getShortCommitId()));
    messageHeader
        .getSource()
        .addExtension()
        .setUrl("https://reportstream.cdc.gov/fhir/StructureDefinition/software-install-date")
        .setValue(new InstantType(gitProperties.getCommitTime().toString()));
    messageHeader
        .getSource()
        .addExtension()
        .setUrl("https://reportstream.cdc.gov/fhir/StructureDefinition/software-vendor-org")
        .setValue(new Reference(ResourceType.Organization + "/" + SIMPLE_REPORT_ORG_ID));
    messageHeader
        .getMeta()
        // QUESTION: Processing ID in the message header: P or T like in the FhirConverter?
        .addTag(PROCESSING_ID_SYSTEM, processingId, PROCESSING_ID_DISPLAY.get(processingId));

    return messageHeader;
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
    // QUESTION: Assuming this is the LOINC_CODE_SYSTEM that we're using?
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
