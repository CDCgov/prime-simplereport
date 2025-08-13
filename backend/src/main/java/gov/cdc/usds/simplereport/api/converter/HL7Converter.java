package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.HL7Constants.APHL_ORG_OID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.CLIA_NAMING_SYSTEM_OID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.HL7_LOINC_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.HL7_SNOMED_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.HL7_SNOMED_CODE_SYSTEM_VERSION_ID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.HL7_TABLE_ETHNIC_GROUP;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.HL7_TABLE_RACE;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.HL7_VERSION_ID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.MESSAGE_PROFILE_ID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.MESSAGE_PROFILE_NAMESPACE;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.MESSAGE_PROFILE_OID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.NPI_NAMING_SYSTEM_OID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.SIMPLE_REPORT_NAME;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.SIMPLE_REPORT_ORG_OID;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7DateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.CLIA_REGEX;

import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v251.datatype.CE;
import ca.uhn.hl7v2.model.v251.datatype.CWE;
import ca.uhn.hl7v2.model.v251.datatype.CX;
import ca.uhn.hl7v2.model.v251.datatype.EI;
import ca.uhn.hl7v2.model.v251.datatype.IS;
import ca.uhn.hl7v2.model.v251.datatype.XAD;
import ca.uhn.hl7v2.model.v251.datatype.XCN;
import ca.uhn.hl7v2.model.v251.datatype.XON;
import ca.uhn.hl7v2.model.v251.datatype.XPN;
import ca.uhn.hl7v2.model.v251.datatype.XTN;
import ca.uhn.hl7v2.model.v251.group.ORU_R01_ORDER_OBSERVATION;
import ca.uhn.hl7v2.model.v251.message.ORU_R01;
import ca.uhn.hl7v2.model.v251.segment.MSH;
import ca.uhn.hl7v2.model.v251.segment.OBR;
import ca.uhn.hl7v2.model.v251.segment.OBX;
import ca.uhn.hl7v2.model.v251.segment.ORC;
import ca.uhn.hl7v2.model.v251.segment.PID;
import ca.uhn.hl7v2.model.v251.segment.SFT;
import ca.uhn.hl7v2.model.v251.segment.SPM;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ResultScaleType;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
@SuppressWarnings({"checkstyle:TodoComment"})
public class HL7Converter {
  // Used for easier mocking of UUID.randomUUID()
  private final UUIDGenerator uuidGenerator;
  // Used for easier mocking of new Date()
  private final DateGenerator dateGenerator;

  /**
   * Creates HL7 message from a single entry TestEvent
   *
   * @param testEvent single entry test event data
   * @param gitProperties used to populate the message software segment
   * @param processingId indicates intent for processing. Must be either T for training, D for
   *     debugging, or P for production (see HL7 table 0103)
   * @return ORU_R01 message
   */
  public ORU_R01 createLabReportMessage(
      @NotNull TestEvent testEvent, GitProperties gitProperties, String processingId)
      throws DataTypeException {
    return createLabReportMessage(
        convertToPatientReportInput(testEvent),
        convertToProviderReportInput(testEvent),
        convertToFacilityReportInput(testEvent),
        null,
        convertToSpecimenInput(testEvent),
        convertToTestDetailsInputList(testEvent),
        gitProperties,
        processingId,
        testEvent.getTestOrderId().toString());
  }

  /**
   * Creates an ORU_R01 message based on HL7 Version 2.5.1 Implementation Guide: Electronic
   * Laboratory Reporting to Public Health. ORU_R01 refers to an "Unsolicited transmission of an
   * observation message"
   *
   * @param patientInput patient data
   * @param providerInput ordering provider data
   * @param performingFacility facility that performed the testing
   * @param orderingFacility facility that ordered the testing. If this is null, then ordering
   *     facility will be populated with the performing facility data based on the legacy app
   *     assumption that this is the same facility
   * @param specimenInput specimen data
   * @param testDetailsInputList test result data
   * @param gitProperties used to populate the message software segment
   * @param processingId indicates intent for processing. Must be either T for training, D for
   *     debugging, or P for production (see HL7 table 0103)
   * @param orderId used to populate the Filler Order Number in OBR-3 and ORC-3. This should be the
   *     TestEvent id for single entry or the accession number for bulk upload. This parameter is
   *     not the same as the message control id in MSH-10 which is randomly generated.
   * @return ORU_R01 message
   * @throws DataTypeException if the HAPI package encounters a problem with the validity of a
   *     primitive data type
   * @throws IllegalArgumentException if input data is invalid
   */
  public ORU_R01 createLabReportMessage(
      PatientReportInput patientInput,
      ProviderReportInput providerInput,
      FacilityReportInput performingFacility,
      FacilityReportInput orderingFacility,
      SpecimenInput specimenInput,
      List<TestDetailsInput> testDetailsInputList,
      GitProperties gitProperties,
      String processingId,
      String orderId)
      throws DataTypeException, IllegalArgumentException {
    // Lab reports from single entry and bulk upload should always have order id already populated.
    // Single entry would use TestEvent internal id which is always required. Bulk upload would use
    // Accession Number which is also required.
    if (StringUtils.isBlank(orderId)) {
      throw new IllegalArgumentException("Missing orderId for lab report message");
    }

    ORU_R01 message = new ORU_R01();

    Date messageTimestamp = dateGenerator.newDate();

    MSH messageHeader = message.getMSH();
    populateMessageHeader(
        messageHeader, performingFacility.getClia(), processingId, messageTimestamp);

    SFT softwareSegment = message.getSFT();
    populateSoftwareSegment(softwareSegment, gitProperties);

    PID patientIdentificationSegment = message.getPATIENT_RESULT().getPATIENT().getPID();
    populatePatientIdentification(patientIdentificationSegment, patientInput);

    String specimenId = String.valueOf(uuidGenerator.randomUUID());

    if (orderingFacility == null) {
      orderingFacility = performingFacility;
    }

    // Since multiple ordered tests may be performed on a specimen, we need to group the test
    // details based on test order loinc in order to correctly populate the observation
    // request OBR and its list of observation results OBX.
    // See page 81, HL7 v2.5.1 IG
    Map<String, List<TestDetailsInput>> testOrderLoincToTestDetailsMap =
        mapTestOrderLoincToTestDetails(testDetailsInputList);

    int orderObservationIndex = 0;
    for (var entry : testOrderLoincToTestDetailsMap.entrySet()) {
      ORU_R01_ORDER_OBSERVATION orderGroup =
          message.getPATIENT_RESULT().getORDER_OBSERVATION(orderObservationIndex);

      // The first ORDER_OBSERVATION group must contain an ORC segment (containing ordering facility
      // information) if no ordering provider information is present in OBR-16 or OBR-17.
      // See page 81, HL7 v2.5.1 IG
      if (orderObservationIndex == 0) {
        ORC commonOrder = orderGroup.getORC();
        populateCommonOrderSegment(commonOrder, orderingFacility, providerInput, orderId);
      }

      // First test detail is picked to get the test order display name
      // and correction status for OBR
      TestDetailsInput firstTestDetail = entry.getValue().get(0);

      OBR observationRequest = orderGroup.getOBR();
      populateObservationRequest(
          observationRequest,
          orderObservationIndex + 1,
          orderId,
          providerInput,
          specimenInput.getCollectionDate(),
          entry.getKey(),
          firstTestDetail.getTestOrderDisplayName(),
          firstTestDetail.getCorrectionStatus(),
          messageTimestamp);

      // Populate the list of OBX associated with this OBR
      int observationResultIndex = 0;
      for (TestDetailsInput testDetail : entry.getValue()) {
        OBX observationResult = orderGroup.getOBSERVATION(observationResultIndex).getOBX();
        populateObservationResult(
            observationResult,
            observationResultIndex + 1,
            performingFacility,
            specimenInput.getCollectionDate(),
            testDetail);
        observationResultIndex++;
      }

      // Only a single specimen can be associated with the OBR
      // See page 83, HL7 v2.5.1 IG
      if (orderObservationIndex == 0) {
        SPM specimen = orderGroup.getSPECIMEN().getSPM();
        populateSpecimen(specimen, 1, specimenId, specimenInput);
      }

      orderObservationIndex++;
    }

    return message;
  }

  private Map<String, List<TestDetailsInput>> mapTestOrderLoincToTestDetails(
      List<TestDetailsInput> testDetailsInputList) {
    Map<String, List<TestDetailsInput>> testOrderLoincToTestDetailsMap = new HashMap<>();
    for (TestDetailsInput testDetail : testDetailsInputList) {
      String testOrderLoinc = testDetail.getTestOrderLoinc();
      if (!testOrderLoincToTestDetailsMap.containsKey(testOrderLoinc)) {
        testOrderLoincToTestDetailsMap.put(
            testOrderLoinc,
            testDetailsInputList.stream()
                .filter(t -> t.getTestOrderLoinc().equals(testOrderLoinc))
                .toList());
      }
    }
    return testOrderLoincToTestDetailsMap;
  }

  /**
   * The Message Header Segment (MSH) contains information describing how to parse and process the
   * message. This includes identification of message delimiters, sender, receiver, message type,
   * timestamp, etc. See page 90, HL7 v2.5.1 IG.
   *
   * @param msh the Message Header Segment (MSH) object from the message
   * @param sendingFacilityClia CLIA number for the facility sending the lab report
   * @param processingId Indicates intent for processing. Must be either T for training, D for
   *     debugging, or P for production (see HL7 table 0103)
   * @param messageTimestamp Must be greater than or equal to the value of OBR-22 Results
   *     Report/Status Change Datetime
   * @throws DataTypeException if the HAPI package encounters a problem with the validity of a
   *     primitive data type
   * @throws IllegalArgumentException if facility CLIA number does not match required format, or if
   *     processing id is not T, D, or P
   */
  void populateMessageHeader(
      MSH msh, String sendingFacilityClia, String processingId, Date messageTimestamp)
      throws DataTypeException, IllegalArgumentException {
    if (!sendingFacilityClia.matches(CLIA_REGEX)) {
      throw new IllegalArgumentException("Sending facility CLIA number must match CLIA format");
    }
    if (!processingId.matches("^[TDP]$")) {
      throw new IllegalArgumentException(
          "Processing id must be one of 'T' for testing, 'D' for debugging, or 'P' for production");
    }

    msh.getMsh1_FieldSeparator().setValue("|");
    msh.getMsh2_EncodingCharacters().setValue("^~\\&");
    msh.getMsh3_SendingApplication().getHd1_NamespaceID().setValue("SimpleReport");
    msh.getMsh3_SendingApplication().getHd2_UniversalID().setValue(SIMPLE_REPORT_ORG_OID);
    msh.getMsh3_SendingApplication().getHd3_UniversalIDType().setValue("ISO");

    msh.getMsh4_SendingFacility().getHd2_UniversalID().setValue(sendingFacilityClia);
    // CLIA is allowed for MSH-4 even though it is not in the Universal ID Type value set of HL70301
    msh.getMsh4_SendingFacility().getHd3_UniversalIDType().setValue("CLIA");

    msh.getMsh5_ReceivingApplication().getHd2_UniversalID().setValue(APHL_ORG_OID);
    msh.getMsh5_ReceivingApplication().getHd3_UniversalIDType().setValue("ISO");

    msh.getMsh6_ReceivingFacility().getHd2_UniversalID().setValue(APHL_ORG_OID);
    msh.getMsh6_ReceivingFacility().getHd3_UniversalIDType().setValue("ISO");

    msh.getMsh7_DateTimeOfMessage().getTs1_Time().setValue(formatToHL7DateTime(messageTimestamp));

    /*
    "ORU^R01^ORU_R01" is the Message Type used for result messages in the HL7v2.5.1 IG

    These values originate from the following HL7 tables:
    ORU from HL70076 Message Type
    R01 from HL70003 Event Type
    ORU_R01 from HL70354 Message Structure
    */
    msh.getMsh9_MessageType().getMsg1_MessageCode().setValue("ORU");
    msh.getMsh9_MessageType().getMsg2_TriggerEvent().setValue("R01");
    msh.getMsh9_MessageType().getMsg3_MessageStructure().setValue("ORU_R01");

    msh.getMsh10_MessageControlID().setValue(uuidGenerator.randomUUID().toString());

    msh.getMsh11_ProcessingID().getPt1_ProcessingID().setValue(processingId);

    msh.getMsh12_VersionID().getVersionID().setValue(HL7_VERSION_ID);

    msh.getMsh17_CountryCode().setValue(DEFAULT_COUNTRY);

    // TODO: confirm with AIMS which message profile ID to use
    EI messageProfileIdentifier = msh.getMsh21_MessageProfileIdentifier(0);
    messageProfileIdentifier.getEi1_EntityIdentifier().setValue(MESSAGE_PROFILE_ID);
    messageProfileIdentifier.getEi2_NamespaceID().setValue(MESSAGE_PROFILE_NAMESPACE);
    messageProfileIdentifier.getEi3_UniversalID().setValue(MESSAGE_PROFILE_OID);
    messageProfileIdentifier.getEi4_UniversalIDType().setValue("ISO");
  }

  /**
   * The Software Segment (SFT) provides information about the sending application or other
   * applications that manipulate the message before the receiving application processes the
   * message. See page 96, HL7 v2.5.1 IG.
   *
   * @param sft the Software Segment (SFT) object from the message
   * @param gitProperties used for software version, binary id, and install date
   * @throws DataTypeException if the HAPI package encounters a problem with the validity of a
   *     primitive data type
   */
  void populateSoftwareSegment(SFT sft, GitProperties gitProperties) throws DataTypeException {
    XON softwareOrg = sft.getSft1_SoftwareVendorOrganization();
    softwareOrg.getXon1_OrganizationName().setValue(SIMPLE_REPORT_NAME);

    sft.getSft2_SoftwareCertifiedVersionOrReleaseNumber()
        .setValue(gitProperties.getShortCommitId());
    sft.getSft3_SoftwareProductName().setValue(SIMPLE_REPORT_NAME);
    sft.getSft4_SoftwareBinaryID().setValue(gitProperties.getShortCommitId());

    /*
    "It is strongly recommended that the time zone offset always be included in the DTM". See page 30, HL7v2.5.1 IG.

    If the zone offset is not provided in the string for DTM.setValue, then DTM will default to the machine's time zone.
    This would lead to unit tests producing different results based on the machine.
    */
    sft.getSft6_SoftwareInstallDate()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(gitProperties.getCommitTime()));
  }

  /**
   * The Patient Identification Segment (PID) is used to provide basic demographics regarding the
   * subject of the testing. See page 100, HL7 v2.5.1 IG.
   *
   * @param pid the PID object from the message's PATIENT_RESULT.PATIENT group
   * @param patientInput the input containing the form values for patient
   * @throws DataTypeException if the HAPI package encounters a problem with the validity of a
   *     primitive data type
   */
  void populatePatientIdentification(PID pid, PatientReportInput patientInput)
      throws DataTypeException {
    // PID Sequence 1 is "Set ID - PID" which is used to identify repetitions.
    // Since the ORU^R01 message only allows one Patient per message, the HL7 IG says this must be
    // the literal value '1'.
    pid.getPid1_SetIDPID().setValue("1");

    CX patientIdentifierEntry = pid.getPid3_PatientIdentifierList(0);

    // Legacy app test events should already have a patient ID on patientInput
    String patientId = patientInput.getPatientId();
    if (StringUtils.isBlank(patientId)) {
      patientId = uuidGenerator.randomUUID().toString();
    }

    patientIdentifierEntry.getCx1_IDNumber().setValue(patientId);
    patientIdentifierEntry
        .getCx4_AssigningAuthority()
        .getHd2_UniversalID()
        .setValue(SIMPLE_REPORT_ORG_OID);
    patientIdentifierEntry.getCx4_AssigningAuthority().getHd3_UniversalIDType().setValue("ISO");
    // PI is the value for Patient internal identifier on HL7 table 0203 Identifier type
    patientIdentifierEntry.getCx5_IdentifierTypeCode().setValue("PI");

    populateName(
        pid.getPid5_PatientName(0),
        patientInput.getFirstName(),
        patientInput.getMiddleName(),
        patientInput.getLastName(),
        patientInput.getSuffix());

    pid.getPid7_DateTimeOfBirth()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(patientInput.getDateOfBirth()));

    populateAdministrativeSex(pid.getPid8_AdministrativeSex(), patientInput.getSex());

    populateRace(pid.getPid10_Race(0), patientInput.getRace());

    populateEthnicGroup(pid.getPid22_EthnicGroup(0), patientInput.getEthnicity());

    populateExtendedAddress(
        pid.getPid11_PatientAddress(0),
        patientInput.getStreet(),
        patientInput.getStreetTwo(),
        patientInput.getCity(),
        patientInput.getState(),
        patientInput.getZipCode(),
        patientInput.getCountry());

    if (StringUtils.isNotBlank(patientInput.getPhone())) {
      populatePhoneNumber(pid.getPid13_PhoneNumberHome(0), patientInput.getPhone());
    }

    if (StringUtils.isNotBlank(patientInput.getEmail())) {
      int nextRepetitionIndex = pid.getPid13_PhoneNumberHomeReps();
      // For some reason, email address is indeed stored on the PhoneNumberHome element array
      populateEmailAddress(
          pid.getPid13_PhoneNumberHome(nextRepetitionIndex), patientInput.getEmail());
    }

    // TODO: determine HL7 valid tribal affiliation code system values
    /*
    Cannot currently populate tribal citizenship due to limitations on providing coding system data

    populateTribalCitizenship(
            pid.getPid39_TribalCitizenship(0), patientInput.getTribalAffiliation());
     */

  }

  /** Populates the Extended Person Name (XPN) object */
  void populateName(
      XPN extendedPersonName, String firstName, String middleName, String lastName, String suffix)
      throws DataTypeException {
    extendedPersonName.getXpn1_FamilyName().getFn1_Surname().setValue(lastName);
    extendedPersonName.getXpn2_GivenName().setValue(firstName);
    extendedPersonName.getXpn3_SecondAndFurtherGivenNamesOrInitialsThereof().setValue(middleName);
    extendedPersonName.getXpn4_SuffixEgJRorIII().setValue(suffix);
  }

  /**
   * Populates coded value with administrative sex. If null or unknown, populates with U for
   * Unknown.
   *
   * @param administrativeSex Coded value object to be populated
   * @param patientSex This should be a value on the HL7 0001 Sex table
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   */
  void populateAdministrativeSex(IS administrativeSex, String patientSex) throws DataTypeException {
    if (patientSex == null) {
      administrativeSex.setValue("U");
      return;
    }

    switch (patientSex.toLowerCase()) {
      case "male", "m" -> administrativeSex.setValue("M");
      case "female", "f" -> administrativeSex.setValue("F");
      default -> administrativeSex.setValue("U");
    }
  }

  /**
   * Populates coded element with race data or leaves the element blank if not valid.
   *
   * @param codedElement Coded element to be populated. Note that the implementation guide
   *     technically states this should be a CWE datatype for PID-10, but the HAPI library
   *     implements this as CE.
   * @param race This should be a value on the HL7 0005 Race table
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   */
  void populateRace(CE codedElement, String race) throws DataTypeException {
    boolean isParseableRace =
        StringUtils.isNotBlank(race) && PersonUtils.HL7_RACE_MAP.containsKey(race.toLowerCase());

    if (isParseableRace) {
      codedElement.getCe1_Identifier().setValue(PersonUtils.HL7_RACE_MAP.get(race).get(0));
      codedElement.getCe2_Text().setValue(PersonUtils.HL7_RACE_MAP.get(race).get(1));
      codedElement.getCe3_NameOfCodingSystem().setValue(HL7_TABLE_RACE);
    }
  }

  /**
   * Populates coded element with ethnic group data. If invalid or unknown, populates with U for
   * Unknown.
   *
   * @param codedElement Coded element to be populated. Note that the implementation guide
   *     technically states this should be a CWE datatype for PID-22, but the HAPI library
   *     implements this as CE.
   * @param ethnicity This should be a key on PersonUtils.ETHNICITY_MAP
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   */
  void populateEthnicGroup(CE codedElement, String ethnicity) throws DataTypeException {
    boolean isParseableEthnicGroup =
        StringUtils.isNotBlank(ethnicity)
            && PersonUtils.ETHNICITY_MAP.containsKey(ethnicity.toLowerCase());

    String identifier =
        isParseableEthnicGroup ? PersonUtils.ETHNICITY_MAP.get(ethnicity).get(0) : "U";
    String text =
        isParseableEthnicGroup ? PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1) : "unknown";

    codedElement.getCe1_Identifier().setValue(identifier);
    codedElement.getCe2_Text().setValue(text);
    codedElement.getCe3_NameOfCodingSystem().setValue(HL7_TABLE_ETHNIC_GROUP);
  }

  // TODO: determine how we should send tribal citizenship data
  void populateTribalCitizenship(CWE codedElement, String tribalAffiliationCode)
      throws DataTypeException {
    /*
    There is an HL7 code system for tribal entity called TribalEntityUS.
    However, there is no way to refer to this system while still being constrained
    to the values in HL7 0396. This field is also limited to 12 characters,
    so even TribalEntityUS is too long.

    CWE-3 name of coding system is required if CWE-1 and CWE-2 are provided
    codedElement.getCwe1_Identifier().setValue(tribalAffiliationCode);
    codedElement.getCwe2_Text().setValue(PersonUtils.tribalMap().get(tribalAffiliationCode));
    codedElement
            .getCwe3_NameOfCodingSystem()
            .setValue(TRIBAL_AFFILIATION_CODE_SYSTEM_NAME);

    codedElement.getCwe7_CodingSystemVersionID().setValue(TRIBAL_AFFILIATION_CODE_SYSTEM_VERSION);

    CWE datatype also has no object member for CWE 14 which should be Coding System OID
     */
  }

  /**
   * Populates area code and local number on the extended telecommunication number (XTN). See page
   * 63, HL7 v2.5.1 IG
   *
   * @param xtn Extended telecommunication number.
   * @param phoneNumber Must contain exactly 10 digits.
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   * @throws IllegalArgumentException if phone number does not have exactly 10 digits
   */
  void populatePhoneNumber(XTN xtn, String phoneNumber)
      throws DataTypeException, IllegalArgumentException {
    if (StringUtils.isBlank(phoneNumber)) {
      return;
    }
    String strippedNumber =
        phoneNumber
            .replaceAll("-", "")
            .replaceAll("\\(", "")
            .replaceAll("\\)", "")
            .replaceAll(" ", "");
    final int requiredPhoneNumberLength = 10;
    if (strippedNumber.length() != requiredPhoneNumberLength) {
      throw new IllegalArgumentException(
          "Phone number must have exactly 10 digits to populate XTN.");
    }
    final int localNumberStartIndex = 3;
    xtn.getXtn6_AreaCityCode().setValue(strippedNumber.substring(0, localNumberStartIndex));
    // If XTN-7 Local Number is present, XTN-4 Email Address must be empty
    xtn.getXtn7_LocalNumber().setValue(strippedNumber.substring(localNumberStartIndex));
  }

  /**
   * Populates email address on the extended telecommunication number (XTN). See page 63, HL7 v2.5.1
   * IG
   *
   * @param xtn Extended telecommunication number.
   * @param emailAddress the email address
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   */
  void populateEmailAddress(XTN xtn, String emailAddress) throws DataTypeException {
    xtn.getXtn2_TelecommunicationUseCode().setValue("NET");
    xtn.getXtn3_TelecommunicationEquipmentType().setValue("Internet");
    // If XTN-4 Email Address is present, XTN-7 Local Number must be empty
    xtn.getXtn4_EmailAddress().setValue(emailAddress);
  }

  /**
   * Populates extended address (XAD), except for county code in XAD-9 since that requires FIPS
   * codes
   */
  void populateExtendedAddress(
      XAD extendedAddress,
      String street,
      String streetTwo,
      String city,
      String state,
      String zipCode,
      String country)
      throws DataTypeException {
    extendedAddress.getXad1_StreetAddress().getSad1_StreetOrMailingAddress().setValue(street);
    extendedAddress.getXad2_OtherDesignation().setValue(streetTwo);
    extendedAddress.getXad3_City().setValue(city);
    extendedAddress.getXad4_StateOrProvince().setValue(state);
    extendedAddress.getXad5_ZipOrPostalCode().setValue(zipCode);
    extendedAddress.getXad6_Country().setValue(country);
    // To populate county code, we would need to use FIPS codes.
    // extendedAddress.getXad9_CountyParishCode().setValue(county);
  }

  /**
   * The Common Order Segment (ORC) identifies basic information about the order for testing of the
   * specimen. This segment includes identifiers for the order, who placed the order, when it was
   * placed, what action to take regarding the order, etc
   *
   * @param commonOrder The ORC object to be populated
   * @param orderingFacility Facility that ordered the test
   * @param orderingProvider Provider who ordered the test
   * @param orderId Used for filler order number
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   * @throws IllegalArgumentException if ordering facility is missing both phone number and email
   *     address
   */
  void populateCommonOrderSegment(
      ORC commonOrder,
      FacilityReportInput orderingFacility,
      ProviderReportInput orderingProvider,
      String orderId)
      throws DataTypeException, IllegalArgumentException {
    if (StringUtils.isBlank(orderingFacility.getPhone())
        && StringUtils.isBlank(orderingFacility.getEmail())) {
      throw new IllegalArgumentException(
          "Ordering facility must contain at least phone number or email address for ORC-23");
    }

    // In the ORU^R01 this should be the literal value: "RE." See page 120, HL7 v2.5.1 IG
    // RE is the value for "Observations to follow" on HL7 table 0119
    commonOrder.getOrc1_OrderControl().setValue("RE");

    // ORC-3 must contain the same value as OBR-3 Filler Order Number.
    populateEntityIdentifierOID(commonOrder.getOrc3_FillerOrderNumber(), orderId);

    populateOrderingProvider(commonOrder.getOrc12_OrderingProvider(0), orderingProvider);

    commonOrder
        .getOrc21_OrderingFacilityName(0)
        .getXon1_OrganizationName()
        .setValue(orderingFacility.getName());

    populateExtendedAddress(
        commonOrder.getOrc22_OrderingFacilityAddress(0),
        orderingFacility.getStreet(),
        orderingFacility.getStreetTwo(),
        orderingFacility.getCity(),
        orderingFacility.getState(),
        orderingFacility.getZipCode(),
        DEFAULT_COUNTRY);

    if (StringUtils.isNotBlank(orderingFacility.getPhone())) {
      populatePhoneNumber(
          commonOrder.getOrc23_OrderingFacilityPhoneNumber(0), orderingFacility.getPhone());
    }

    if (StringUtils.isNotBlank(orderingFacility.getEmail())) {
      int nextRepetitionIndex = commonOrder.getOrc23_OrderingFacilityPhoneNumberReps();
      populateEmailAddress(
          commonOrder.getOrc23_OrderingFacilityPhoneNumber(nextRepetitionIndex),
          orderingFacility.getEmail());
    }

    populateExtendedAddress(
        commonOrder.getOrc24_OrderingProviderAddress(0),
        orderingProvider.getStreet(),
        orderingProvider.getStreetTwo(),
        orderingProvider.getCity(),
        orderingProvider.getState(),
        orderingProvider.getZipCode(),
        DEFAULT_COUNTRY);
  }

  /**
   * Populates an Entity Identifier (EI) with the provided id and SimpleReport as the assigning
   * authority for that id
   */
  void populateEntityIdentifierOID(EI entityIdentifier, String id) throws DataTypeException {
    entityIdentifier.getEi1_EntityIdentifier().setValue(id);
    // EI-3 contains the universal ID for the assigning authority,
    // not the universal ID for the entity itself
    entityIdentifier.getEi3_UniversalID().setValue(SIMPLE_REPORT_ORG_OID);
    entityIdentifier.getEi4_UniversalIDType().setValue("ISO");
  }

  /** Populates name and NPI for ordering provider */
  void populateOrderingProvider(XCN orderingProvider, ProviderReportInput providerInput)
      throws DataTypeException {
    orderingProvider.getXcn1_IDNumber().setValue(providerInput.getNpi());

    orderingProvider.getXcn2_FamilyName().getFn1_Surname().setValue(providerInput.getLastName());
    orderingProvider.getXcn3_GivenName().setValue(providerInput.getFirstName());
    orderingProvider
        .getXcn4_SecondAndFurtherGivenNamesOrInitialsThereof()
        .setValue(providerInput.getMiddleName());
    orderingProvider.getXcn5_SuffixEgJRorIII().setValue(providerInput.getSuffix());

    orderingProvider
        .getXcn9_AssigningAuthority()
        .getHd2_UniversalID()
        .setValue(NPI_NAMING_SYSTEM_OID);
    orderingProvider.getXcn9_AssigningAuthority().getHd3_UniversalIDType().setValue("ISO");
    orderingProvider.getXcn13_IdentifierTypeCode().setValue("NPI");
  }

  /**
   * The Observation Request Segment (OBR) is used to capture information about one test being
   * performed on the specimen. Most importantly, the OBR identifies the type of testing to be
   * performed on the specimen and ties that information to the order for the testing.
   *
   * @param observationRequest The OBR object to populate
   * @param sequenceNumber Used to identify segment repeats
   * @param orderId Used for filler order number
   * @param orderingProvider Provider who ordered the test
   * @param specimenCollectionDate Date time the specimen was collected
   * @param testOrderLoinc All OBR segment repeats should use the same test order LOINC
   * @param testOrderDisplay This should be the same test order LOINC for all OBR within this
   *     message
   * @param messageTimestamp Must be less than or equal to the value of MSH-7 Date Time of Message
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   */
  void populateObservationRequest(
      OBR observationRequest,
      int sequenceNumber,
      String orderId,
      ProviderReportInput orderingProvider,
      Date specimenCollectionDate,
      String testOrderLoinc,
      String testOrderDisplay,
      String correctionStatus,
      Date messageTimestamp)
      throws DataTypeException {
    observationRequest.getObr1_SetIDOBR().setValue(String.valueOf(sequenceNumber));

    // OBR-3 must contain the same value as ORC-3 Filler Order Number.
    populateEntityIdentifierOID(observationRequest.getObr3_FillerOrderNumber(), orderId);

    // IG says this should be a CWE datatype, but the API implements it as a CE datatype
    CE serviceIdentifier = observationRequest.getObr4_UniversalServiceIdentifier();
    serviceIdentifier.getCe1_Identifier().setValue(testOrderLoinc);
    serviceIdentifier.getCe2_Text().setValue(testOrderDisplay);
    serviceIdentifier.getCe3_NameOfCodingSystem().setValue(HL7_LOINC_CODE_SYSTEM);

    observationRequest
        .getObr7_ObservationDateTime()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(specimenCollectionDate));

    observationRequest
        .getObr8_ObservationEndDateTime()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(specimenCollectionDate));

    populateOrderingProvider(observationRequest.getObr16_OrderingProvider(0), orderingProvider);

    observationRequest
        .getObr22_ResultsRptStatusChngDateTime()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(messageTimestamp));

    // F for final results, from HL7 table 0123 Result Status
    String resultStatus = StringUtils.isBlank(correctionStatus) ? "F" : correctionStatus;
    observationRequest.getObr25_ResultStatus().setValue(resultStatus);
  }

  /**
   * The Observation/Result Segment (OBX) contains information regarding a single observation
   * related to a single test (OBR) or specimen (SPM). This includes identification of the specific
   * type of observation, the result for the observation, when the observation was made, etc.
   *
   * @param obx The OBX object to populate
   * @param sequenceNumber Used to identify segment repeats
   * @param performingFacility Facility that produced the test result described in this segment
   * @param specimenCollectionDate Used to populate the time of the observation
   * @param testDetail The test result data
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   * @throws IllegalArgumentException if non-ordinal result type is provided
   */
  void populateObservationResult(
      OBX obx,
      int sequenceNumber,
      FacilityReportInput performingFacility,
      Date specimenCollectionDate,
      TestDetailsInput testDetail)
      throws DataTypeException, IllegalArgumentException {
    obx.getObx1_SetIDOBX().setValue(String.valueOf(sequenceNumber));

    CE observationIdentifier = obx.getObx3_ObservationIdentifier();
    observationIdentifier.getCe1_Identifier().setValue(testDetail.getTestPerformedLoinc());
    observationIdentifier.getCe2_Text().setValue(testDetail.getTestPerformedLoincLongCommonName());
    observationIdentifier.getCe3_NameOfCodingSystem().setValue(HL7_LOINC_CODE_SYSTEM);

    if (testDetail.getResultType().equals(ResultScaleType.ORDINAL)) {
      // CE for Coded Entry, from HL7 table 0125 Value Type
      obx.getObx2_ValueType().setValue("CE");

      CE observationValue = new CE(obx.getMessage());
      observationValue.getCe1_Identifier().setValue(testDetail.getResultValue());
      // We could add CE-2 text here, but we'd need to add that info to the test detail in order to
      // determine what the naming is (i.e. positive/negative vs reactive/non-reactive)
      observationValue.getCe3_NameOfCodingSystem().setValue(HL7_SNOMED_CODE_SYSTEM);

      obx.getObservationValue(0).setData(observationValue);
    } else {
      // TODO: handle quantitative and nominal result types. See page 145, HL7 v2.5.1 IG
      throw new IllegalArgumentException("Non-ordinal result types are not currently supported");
    }

    // TODO: determine how we should programmatically set OBX 8 - Abnormal flags

    // F for final results, from HL7 table 0085 Observation result status codes interpretation
    String resultStatus =
        StringUtils.isBlank(testDetail.getCorrectionStatus())
            ? "F"
            : testDetail.getCorrectionStatus();
    obx.getObx11_ObservationResultStatus().setValue(resultStatus);

    // "For specimen-based laboratory reporting, the specimen collection date and time."
    // See page 142, HL7 v2.5.1 IG
    obx.getObx14_DateTimeOfTheObservation()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(specimenCollectionDate));

    // "Time at which the testing was performed."
    // See page 143, HL7 v2.5.1 IG
    obx.getObx19_DateTimeOfTheAnalysis()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(testDetail.getResultDate()));

    XON performingOrganizationName = obx.getObx23_PerformingOrganizationName();
    performingOrganizationName.getXon1_OrganizationName().setValue(performingFacility.getName());
    performingOrganizationName
        .getXon6_AssigningAuthority()
        .getHd2_UniversalID()
        .setValue(CLIA_NAMING_SYSTEM_OID);
    performingOrganizationName
        .getXon6_AssigningAuthority()
        .getHd3_UniversalIDType()
        .setValue("ISO");
    // FI is the value for Facility ID on HL7 table 0203 Identifier type
    performingOrganizationName.getXon7_IdentifierTypeCode().setValue("FI");
    performingOrganizationName
        .getXon10_OrganizationIdentifier()
        .setValue(performingFacility.getClia());

    populateExtendedAddress(
        obx.getObx24_PerformingOrganizationAddress(),
        performingFacility.getStreet(),
        performingFacility.getStreetTwo(),
        performingFacility.getCity(),
        performingFacility.getState(),
        performingFacility.getZipCode(),
        DEFAULT_COUNTRY);

    // TODO: confirm whether we need to send medical director data
    // OBX 25 - Performing Organization Medical Director "required when OBX-24 indicates the
    // performing lab is in a jurisdiction that requires this information"
  }

  /**
   * The Specimen Information Segment (SPM) describes the characteristics of a single sample. The
   * SPM segment carries information regarding the type of specimen, where and how it was collected,
   * who collected it and some basic characteristics of the specimen.
   *
   * @param specimen The SPM object to populate
   * @param sequenceNumber Used to identify segment repeats
   * @param specimenId Unique identifier for the specimen, not the same thing as the placer/filler
   *     order number
   * @param specimenInput Specimen data
   * @throws DataTypeException if the HL7 package encounters a primitive validity error in setValue
   */
  void populateSpecimen(
      SPM specimen, int sequenceNumber, String specimenId, SpecimenInput specimenInput)
      throws DataTypeException {
    specimen.getSpm1_SetIDSPM().setValue(String.valueOf(sequenceNumber));

    populateEntityIdentifierOID(
        specimen.getSpm2_SpecimenID().getEip1_PlacerAssignedIdentifier(), specimenId);
    populateEntityIdentifierOID(
        specimen.getSpm2_SpecimenID().getEip2_FillerAssignedIdentifier(), specimenId);

    specimen
        .getSpm4_SpecimenType()
        .getCwe1_Identifier()
        .setValue(specimenInput.getSnomedTypeCode());
    specimen.getSpm4_SpecimenType().getCwe2_Text().setValue(specimenInput.getSnomedDisplay());
    specimen.getSpm4_SpecimenType().getCwe3_NameOfCodingSystem().setValue(HL7_SNOMED_CODE_SYSTEM);
    specimen
        .getSpm4_SpecimenType()
        .getCwe7_CodingSystemVersionID()
        .setValue(HL7_SNOMED_CODE_SYSTEM_VERSION_ID);

    // TODO: clarify AIMS validation error about specimen source site
    // AIMS validator says the code and code system 'SNM' is not member of the value set 0163,
    // but the HL7 data set says it "Shall contain a value descending from the SNOMED CT Anatomical
    // Structure (91723000) hierarchy"

    if (StringUtils.isNotBlank(specimenInput.getCollectionBodySiteCode())
        && StringUtils.isNotBlank(specimenInput.getCollectionBodySiteName())) {
      specimen
          .getSpm8_SpecimenSourceSite()
          .getCwe1_Identifier()
          .setValue(specimenInput.getCollectionBodySiteCode());

      specimen
          .getSpm8_SpecimenSourceSite()
          .getCwe2_Text()
          .setValue(specimenInput.getCollectionBodySiteName());
      specimen
          .getSpm8_SpecimenSourceSite()
          .getCwe3_NameOfCodingSystem()
          .setValue(HL7_SNOMED_CODE_SYSTEM);
      specimen
          .getSpm8_SpecimenSourceSite()
          .getCwe7_CodingSystemVersionID()
          .setValue(HL7_SNOMED_CODE_SYSTEM_VERSION_ID);
    }

    specimen
        .getSpm17_SpecimenCollectionDateTime()
        .getDr1_RangeStartDateTime()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(specimenInput.getCollectionDate()));
    specimen
        .getSpm17_SpecimenCollectionDateTime()
        .getDr2_RangeEndDateTime()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(specimenInput.getCollectionDate()));

    specimen
        .getSpm18_SpecimenReceivedDateTime()
        .getTs1_Time()
        .setValue(formatToHL7DateTime(specimenInput.getReceivedDate()));
  }

  private PatientReportInput convertToPatientReportInput(@NotNull TestEvent testEvent) {
    boolean hasTribalAffiliation =
        testEvent.getPatientData().getTribalAffiliation() != null
            && !testEvent.getPatientData().getTribalAffiliation().isEmpty();
    return PatientReportInput.builder()
        .firstName(testEvent.getPatientData().getFirstName())
        .middleName(testEvent.getPatientData().getMiddleName())
        .lastName(testEvent.getPatientData().getLastName())
        .suffix(testEvent.getPatientData().getSuffix())
        .email(testEvent.getPatientData().getEmail())
        .phone(testEvent.getPatientData().getTelephone())
        .street(testEvent.getPatientData().getStreet())
        .streetTwo(testEvent.getPatientData().getStreetTwo())
        .city(testEvent.getPatientData().getCity())
        .county(testEvent.getPatientData().getCounty())
        .state(testEvent.getPatientData().getState())
        .zipCode(testEvent.getPatientData().getZipCode())
        .country(testEvent.getPatientData().getCountry())
        .sex(testEvent.getPatientData().getGender())
        .dateOfBirth(testEvent.getPatient().getBirthDate())
        .race(testEvent.getPatientData().getRace())
        .ethnicity(testEvent.getPatientData().getEthnicity())
        .tribalAffiliation(
            hasTribalAffiliation ? testEvent.getPatientData().getTribalAffiliation().get(0) : null)
        .patientId(
            testEvent.getPatientData().getInternalId() != null
                ? testEvent.getPatientData().getInternalId().toString()
                : null)
        .build();
  }

  private ProviderReportInput convertToProviderReportInput(@NotNull TestEvent testEvent) {
    return ProviderReportInput.builder()
        .firstName(testEvent.getProviderData().getNameInfo().getFirstName())
        .middleName(testEvent.getProviderData().getNameInfo().getMiddleName())
        .lastName(testEvent.getProviderData().getNameInfo().getLastName())
        .suffix(testEvent.getProviderData().getNameInfo().getSuffix())
        .npi(testEvent.getProviderData().getProviderId())
        .street(testEvent.getProviderData().getStreet())
        .streetTwo(testEvent.getProviderData().getStreetTwo())
        .city(testEvent.getProviderData().getCity())
        .county(testEvent.getProviderData().getCounty())
        .state(testEvent.getProviderData().getState())
        .zipCode(testEvent.getProviderData().getZipCode())
        .phone(testEvent.getProviderData().getTelephone())
        .email(null)
        .build();
  }

  private FacilityReportInput convertToFacilityReportInput(@NotNull TestEvent testEvent) {
    return FacilityReportInput.builder()
        .name(testEvent.getFacility().getFacilityName())
        .clia(testEvent.getFacility().getCliaNumber())
        .street(testEvent.getFacility().getAddress().getStreetOne())
        .streetTwo(testEvent.getFacility().getAddress().getStreetTwo())
        .city(testEvent.getFacility().getAddress().getCity())
        .county(testEvent.getFacility().getAddress().getCounty())
        .state(testEvent.getFacility().getAddress().getState())
        .zipCode(testEvent.getFacility().getAddress().getPostalCode())
        .phone(testEvent.getFacility().getTelephone())
        .email(testEvent.getFacility().getEmail())
        .build();
  }

  private SpecimenInput convertToSpecimenInput(@NotNull TestEvent testEvent) {
    return SpecimenInput.builder()
        .snomedTypeCode(testEvent.getSpecimenType().getTypeCode())
        .snomedDisplay(testEvent.getSpecimenType().getName())
        .collectionDate(testEvent.getDateTested())
        .receivedDate(testEvent.getDateTested())
        .collectionBodySiteName(testEvent.getSpecimenType().getCollectionLocationName())
        .collectionBodySiteCode(testEvent.getSpecimenType().getCollectionLocationCode())
        .build();
  }

  private List<TestDetailsInput> convertToTestDetailsInputList(@NotNull TestEvent testEvent) {
    return testEvent.getResults().stream()
        .map(
            result -> {
              Set<DeviceTypeDisease> matchingDeviceTypeDiseases =
                  testEvent.getDeviceType().getSupportedDiseaseTestPerformed().stream()
                      .filter(d -> d.getSupportedDisease().equals(result.getDisease()))
                      .collect(Collectors.toSet());

              DeviceTypeDisease correctTestPerformed = null;
              if (matchingDeviceTypeDiseases.size() != 1) {
                // multiple matches for this result, need to infer correct device type disease

                // get count of how many times test ordered LOINC is used for a device
                HashMap<String, Integer> testOrderedLoincCounts = new HashMap<>();
                testEvent
                    .getDeviceType()
                    .getSupportedDiseaseTestPerformed()
                    .forEach(
                        deviceTypeDisease -> {
                          if (!StringUtils.isBlank(deviceTypeDisease.getTestOrderedLoincCode())) {
                            testOrderedLoincCounts.merge(
                                deviceTypeDisease.getTestOrderedLoincCode(), 1, Integer::sum);
                          }
                        });

                if (testEvent.getResults().size() == 1) {
                  // if non-multiplex result, get the device type disease that has the less used
                  // test
                  // ordered LOINC
                  correctTestPerformed =
                      Collections.min(
                          matchingDeviceTypeDiseases,
                          Comparator.comparing(
                              a -> testOrderedLoincCounts.get(a.getTestOrderedLoincCode())));
                } else {
                  // multiplex use case, get the device type disease that has the more frequent test
                  // ordered loinc
                  correctTestPerformed =
                      Collections.max(
                          matchingDeviceTypeDiseases,
                          Comparator.comparing(
                              a -> testOrderedLoincCounts.get(a.getTestOrderedLoincCode())));
                }
              } else {
                correctTestPerformed = matchingDeviceTypeDiseases.stream().findFirst().get();
              }

              if (correctTestPerformed == null) {
                throw new IllegalArgumentException(
                    "Could not find matching DeviceTypeDisease data for the result");
              }

              return convertToTestDetailsInput(
                  result,
                  correctTestPerformed,
                  testEvent.getDateTested(),
                  testEvent.getCorrectionStatus());
            })
        .toList();
  }

  private TestDetailsInput convertToTestDetailsInput(
      Result result,
      DeviceTypeDisease deviceTypeDisease,
      Date resultDate,
      TestCorrectionStatus testCorrectionStatus) {
    return TestDetailsInput.builder()
        .condition(result.getDisease().getName())
        .testOrderLoinc(deviceTypeDisease.getTestOrderedLoincCode())
        .testOrderDisplayName(deviceTypeDisease.getTestOrderedLoincLongName())
        .testPerformedLoinc(deviceTypeDisease.getTestPerformedLoincCode())
        .testPerformedLoincLongCommonName(deviceTypeDisease.getTestPerformedLoincLongName())
        .resultType(ResultScaleType.ORDINAL)
        .resultValue(result.getResultSNOMED())
        .resultDate(resultDate)
        .resultInterpretation(null)
        .correctionStatus(convertToObservationResultStatus(testCorrectionStatus))
        .build();
  }

  /**
   * Converts TestCorrectionStatus to value from HL7 table 0085 Observation result status codes
   * interpretation
   */
  private String convertToObservationResultStatus(TestCorrectionStatus testCorrectionStatus) {
    switch (testCorrectionStatus) {
      case ORIGINAL -> {
        return "F";
      }
      case CORRECTED -> {
        return "C";
      }
      case REMOVED -> {
        return "X";
      }
      default -> {
        throw new IllegalArgumentException(
            "Cannot convert invalid test correction status to observation result status");
      }
    }
  }
}
