package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.HL7Constants.SIMPLE_REPORT_ORG_OID;
import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createMultiplexTestEventWithDate;
import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createMultiplexTestEventWithNoCommonTestOrderedLoincDevice;
import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.createSingleCovidTestEventOnMultiplexDevice;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.when;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.DataTypeException;
import ca.uhn.hl7v2.model.v251.datatype.CE;
import ca.uhn.hl7v2.model.v251.datatype.EI;
import ca.uhn.hl7v2.model.v251.datatype.XAD;
import ca.uhn.hl7v2.model.v251.datatype.XCN;
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
import ca.uhn.hl7v2.parser.Parser;
import com.github.jknack.handlebars.internal.lang3.StringUtils;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ResultScaleType;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest
@ActiveProfiles("test")
class HL7ConverterTest {
  private static final Instant STATIC_INSTANT =
      LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
  private static final String STATIC_INSTANT_HL7_STRING = "20250701000000.0000+0000";
  private static final String STATIC_RANDOM_UUID = "5db534ea-5e97-4861-ba18-d74acc46db15";

  private final HapiContext hapiContext = HapiContextProvider.get();
  @Mock private GitProperties gitProperties;
  @MockBean private UUIDGenerator uuidGenerator;
  @MockBean private DateGenerator dateGenerator;
  @Autowired private HL7Converter hl7Converter;

  @BeforeEach
  public void init() {
    when(gitProperties.getCommitTime()).thenReturn(STATIC_INSTANT);
    when(gitProperties.getShortCommitId()).thenReturn("1234567");
    when(uuidGenerator.randomUUID()).thenReturn(UUID.fromString(STATIC_RANDOM_UUID));
    when(dateGenerator.newDate()).thenReturn(Date.from(STATIC_INSTANT));
  }

  @Test
  void createLabReportMessage_fromTestEvent_valid() throws HL7Exception {
    Date dateTested = Date.from(LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC));
    TestEvent testEvent = createMultiplexTestEventWithDate(dateTested);

    TestOrder testOrder = testEvent.getTestOrder();
    var testOrderId = UUID.fromString("cae01b8c-37dc-4c09-a6d4-ae7bcafc9720");
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    testOrder.setTestEventRef(testEvent);

    ORU_R01 message = hl7Converter.createLabReportMessage(testEvent, gitProperties, "T");

    OBX obx = message.getPATIENT_RESULT().getORDER_OBSERVATION().getOBSERVATION().getOBX();
    assertThat(obx.getObx11_ObservationResultStatus().getValue()).isEqualTo("F");
    assertThat(obx.getObx14_DateTimeOfTheObservation().getTs1_Time().getValue())
        .isEqualTo("20250701000000.0000+0000");

    Parser parser = hapiContext.getPipeParser();
    String encodedMessage = parser.encode(message);
    assertThat(StringUtils.countMatches(encodedMessage, "OBR|")).isEqualTo(1);
    assertThat(StringUtils.countMatches(encodedMessage, "OBX|")).isEqualTo(3);
    assertThat(StringUtils.countMatches(encodedMessage, "SPM|")).isEqualTo(1);
  }

  @Test
  void createLabReportMessage_fromTestEvent_correctionStatus() throws DataTypeException {
    Date dateTested = Date.from(LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC));
    TestEvent originalTestEvent = TestDataBuilder.createMultiplexTestEventWithDate(dateTested);
    var testEventId = UUID.fromString("45e9539f-c9a4-4c86-b79d-4ba2c43f9ee0");
    ReflectionTestUtils.setField(originalTestEvent, "internalId", testEventId);

    TestOrder originalTestOrder = originalTestEvent.getTestOrder();
    var testOrderId = UUID.fromString("cae01b8c-37dc-4c09-a6d4-ae7bcafc9720");
    ReflectionTestUtils.setField(originalTestOrder, "internalId", testOrderId);
    originalTestOrder.setTestEventRef(originalTestEvent);

    Date backdate = Date.from(LocalDate.of(2025, 7, 4).atStartOfDay().toInstant(ZoneOffset.UTC));
    originalTestOrder.setDateTestedBackdate(backdate);

    TestEvent correctedTestEvent =
        new TestEvent(originalTestOrder, TestCorrectionStatus.CORRECTED, "Incorrect date");
    correctedTestEvent.getResults().addAll(originalTestOrder.getResults());

    ORU_R01 message = hl7Converter.createLabReportMessage(correctedTestEvent, gitProperties, "T");

    OBX obx = message.getPATIENT_RESULT().getORDER_OBSERVATION().getOBSERVATION().getOBX();
    assertThat(obx.getObx11_ObservationResultStatus().getValue()).isEqualTo("C");
    assertThat(obx.getObx14_DateTimeOfTheObservation().getTs1_Time().getValue())
        .isEqualTo("20250704000000.0000+0000");
  }

  @Test
  void createLabReportMessage_fromTestEvent_deletionStatus() throws DataTypeException {
    Date dateTested = Date.from(LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC));
    TestEvent originalTestEvent = createMultiplexTestEventWithDate(dateTested);
    var testEventId = UUID.fromString("45e9539f-c9a4-4c86-b79d-4ba2c43f9ee0");
    ReflectionTestUtils.setField(originalTestEvent, "internalId", testEventId);

    TestOrder originalTestOrder = originalTestEvent.getTestOrder();
    var testOrderId = UUID.fromString("cae01b8c-37dc-4c09-a6d4-ae7bcafc9720");
    ReflectionTestUtils.setField(originalTestOrder, "internalId", testOrderId);
    originalTestOrder.setTestEventRef(originalTestEvent);

    TestEvent correctedTestEvent =
        new TestEvent(originalTestEvent, TestCorrectionStatus.REMOVED, "Incorrect person");
    correctedTestEvent.getResults().addAll(originalTestOrder.getResults());

    ORU_R01 message = hl7Converter.createLabReportMessage(correctedTestEvent, gitProperties, "T");

    OBX obx = message.getPATIENT_RESULT().getORDER_OBSERVATION().getOBSERVATION().getOBX();
    assertThat(obx.getObx11_ObservationResultStatus().getValue()).isEqualTo("X");
  }

  @Test
  void createLabReportMessage_fromTestEvent_singleCovidResult_onMultiplexDevice()
      throws HL7Exception {
    Date dateTested = Date.from(LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC));
    TestEvent testEvent = createSingleCovidTestEventOnMultiplexDevice(dateTested);

    TestOrder testOrder = testEvent.getTestOrder();
    var testOrderId = UUID.fromString("cae01b8c-37dc-4c09-a6d4-ae7bcafc9720");
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    testOrder.setTestEventRef(testEvent);

    ORU_R01 message = hl7Converter.createLabReportMessage(testEvent, gitProperties, "T");

    OBR obr = message.getPATIENT_RESULT().getORDER_OBSERVATION().getOBR();
    assertThat(obr.getObr4_UniversalServiceIdentifier().getCe1_Identifier().getValue())
        .isEqualTo("94534-5");

    Parser parser = hapiContext.getPipeParser();
    String encodedMessage = parser.encode(message);
    assertThat(StringUtils.countMatches(encodedMessage, "OBX|")).isEqualTo(1);
  }

  @Test
  void createLabReportMessage_fromTestEvent_multiplex_onDeviceWithNoMultiplexTestOrderedLoinc()
      throws HL7Exception {
    Date dateTested = Date.from(LocalDate.of(2025, 7, 1).atStartOfDay().toInstant(ZoneOffset.UTC));
    TestEvent testEvent = createMultiplexTestEventWithNoCommonTestOrderedLoincDevice(dateTested);

    TestOrder testOrder = testEvent.getTestOrder();
    var testOrderId = UUID.fromString("cae01b8c-37dc-4c09-a6d4-ae7bcafc9720");
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    testOrder.setTestEventRef(testEvent);

    ORU_R01 message = hl7Converter.createLabReportMessage(testEvent, gitProperties, "T");

    List<OBR> obrs =
        message.getPATIENT_RESULT().getORDER_OBSERVATIONAll().stream()
            .map(ORU_R01_ORDER_OBSERVATION::getOBR)
            .toList();
    assertThat(obrs.size()).isEqualTo(2);
    assertThat(
            obrs.stream()
                .map(o -> o.getObr4_UniversalServiceIdentifier().getCe1_Identifier().getValue())
                .collect(Collectors.toSet()))
        .contains("3456-7", "2345-6");

    Parser parser = hapiContext.getPipeParser();
    String encodedMessage = parser.encode(message);
    assertThat(StringUtils.countMatches(encodedMessage, "OBR|")).isEqualTo(2);
  }

  @Test
  void createLabReportMessage_encodesWithoutException() {
    PatientReportInput patientReportInput = TestDataBuilder.createPatientReportInput();
    FacilityReportInput facilityReportInput = TestDataBuilder.createFacilityReportInput();
    ProviderReportInput providerReportInput = TestDataBuilder.createProviderReportInput();
    SpecimenInput specimenInput = TestDataBuilder.createSpecimenInput(dateGenerator);
    List<TestDetailsInput> testDetailsInputList =
        TestDataBuilder.createTestDetailsInputList(dateGenerator);

    assertDoesNotThrow(
        () -> {
          ORU_R01 message =
              hl7Converter.createLabReportMessage(
                  patientReportInput,
                  providerReportInput,
                  facilityReportInput,
                  null,
                  specimenInput,
                  testDetailsInputList,
                  gitProperties,
                  "T",
                  uuidGenerator.randomUUID().toString());

          Parser parser = hapiContext.getPipeParser();
          parser.encode(message);
        });
  }

  @Test
  void createLabReportMessage_orc3_matches_obr3() throws DataTypeException {
    PatientReportInput patientReportInput = TestDataBuilder.createPatientReportInput();
    FacilityReportInput facilityReportInput = TestDataBuilder.createFacilityReportInput();
    ProviderReportInput providerReportInput = TestDataBuilder.createProviderReportInput();
    SpecimenInput specimenInput = TestDataBuilder.createSpecimenInput(dateGenerator);
    List<TestDetailsInput> testDetailsInputList =
        TestDataBuilder.createTestDetailsInputList(dateGenerator);

    ORU_R01 message =
        hl7Converter.createLabReportMessage(
            patientReportInput,
            providerReportInput,
            facilityReportInput,
            null,
            specimenInput,
            testDetailsInputList,
            gitProperties,
            "T",
            uuidGenerator.randomUUID().toString());

    EI commonOrderFillerOrderNumber =
        message.getPATIENT_RESULT().getORDER_OBSERVATION().getORC().getOrc3_FillerOrderNumber();
    EI observationRequestFillerOrderNumber =
        message.getPATIENT_RESULT().getORDER_OBSERVATION().getOBR().getObr3_FillerOrderNumber();
    assertThat(commonOrderFillerOrderNumber.getEi1_EntityIdentifier().getValue())
        .isEqualTo(observationRequestFillerOrderNumber.getEi1_EntityIdentifier().getValue());
  }

  @Test
  void populateMessageHeader_valid() throws DataTypeException {
    MSH msh = new ORU_R01().getMSH();
    String clia = "12D1234567";

    hl7Converter.populateMessageHeader(msh, clia, "T", Date.from(STATIC_INSTANT));

    assertThat(msh.getMsh4_SendingFacility().getHd2_UniversalID().getValue()).isEqualTo(clia);
    assertThat(msh.getMsh7_DateTimeOfMessage().getTs1_Time().getValue())
        .isEqualTo(STATIC_INSTANT_HL7_STRING);
    assertThat(msh.getMsh10_MessageControlID().getValue()).isEqualTo(STATIC_RANDOM_UUID);
    assertThat(msh.getMsh11_ProcessingID().getPt1_ProcessingID().getValue()).isEqualTo("T");
  }

  @Test
  void populateMessageHeader_throwsExceptionFor_invalidProcessingId() {
    MSH msh = new ORU_R01().getMSH();
    String clia = "12D1234567";

    IllegalArgumentException exception =
        assertThrows(
            IllegalArgumentException.class,
            () -> hl7Converter.populateMessageHeader(msh, clia, "F", Date.from(STATIC_INSTANT)));
    assertThat(exception.getMessage())
        .isEqualTo(
            "Processing id must be one of 'T' for testing, 'D' for debugging, or 'P' for production");
  }

  @Test
  void populateSoftwareSegment_valid() throws DataTypeException {
    SFT sft = new ORU_R01().getSFT();

    hl7Converter.populateSoftwareSegment(sft, gitProperties);

    assertThat(sft.getSft1_SoftwareVendorOrganization().getOrganizationName().getValue())
        .isEqualTo("SimpleReport");
    assertThat(sft.getSft2_SoftwareCertifiedVersionOrReleaseNumber().getValue())
        .isEqualTo("1234567");
    assertThat(sft.getSft3_SoftwareProductName().getValue()).isEqualTo("SimpleReport");
    assertThat(sft.getSft4_SoftwareBinaryID().getValue()).isEqualTo("1234567");
    assertThat(sft.getSft6_SoftwareInstallDate().getTs1_Time().getValue())
        .isEqualTo(STATIC_INSTANT_HL7_STRING);
  }

  @Test
  void populatePatientIdentification_valid() throws DataTypeException {
    PID pid = TestDataBuilder.createPatientIdentificationSegment();
    PatientReportInput patientReportInput = TestDataBuilder.createPatientReportInput();

    hl7Converter.populatePatientIdentification(pid, patientReportInput);

    var patientIdentifierEntry = pid.getPid3_PatientIdentifierList(0);

    assertThat(patientIdentifierEntry.getCx1_IDNumber().getValue()).isEqualTo(STATIC_RANDOM_UUID);
    assertThat(patientIdentifierEntry.getCx4_AssigningAuthority().getHd2_UniversalID().getValue())
        .isEqualTo(SIMPLE_REPORT_ORG_OID);
    assertThat(patientIdentifierEntry.getCx5_IdentifierTypeCode().getValue()).isEqualTo("PI");
  }

  @Test
  void populatePatientIdentification_valid_withPatientId() throws DataTypeException {
    PID pid = TestDataBuilder.createPatientIdentificationSegment();
    String predefinedPatientId = "80b1f7ed-a865-47c9-8c52-38ea1a393a63";
    PatientReportInput patientReportInput =
        new PatientReportInput(
            "John",
            "Jacob",
            "Smith",
            "Jr",
            "john@example.com",
            "716-555-1234",
            "123 Main St",
            "Apartment A",
            "Buffalo",
            "Erie",
            "NY",
            "14220",
            "USA",
            "male",
            LocalDate.of(1990, 1, 1),
            "native",
            "not_hispanic",
            "266",
            predefinedPatientId);

    hl7Converter.populatePatientIdentification(pid, patientReportInput);

    var patientIdentifierEntry = pid.getPid3_PatientIdentifierList(0);

    assertThat(patientIdentifierEntry.getCx1_IDNumber().getValue()).isEqualTo(predefinedPatientId);
    assertThat(patientIdentifierEntry.getCx4_AssigningAuthority().getHd2_UniversalID().getValue())
        .isEqualTo(SIMPLE_REPORT_ORG_OID);
    assertThat(patientIdentifierEntry.getCx5_IdentifierTypeCode().getValue()).isEqualTo("PI");
  }

  @Test
  void populatePatientIdentification_dateOfBirth_valid() throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    PatientReportInput patientReportInput = TestDataBuilder.createPatientReportInput();

    hl7Converter.populatePatientIdentification(pid, patientReportInput);

    assertThat(pid.getPid7_DateTimeOfBirth().getTs1_Time().getValue()).isEqualTo("19900101");
  }

  @Test
  void populatePatientIdentification_valid_emailWithoutPhone() throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    PatientReportInput patientReportInput =
        new PatientReportInput(
            "John",
            "Jacob",
            "Smith",
            "Jr",
            "john@example.com",
            "",
            "123 Main St",
            "Apartment A",
            "Buffalo",
            "Erie",
            "NY",
            "14220",
            "USA",
            "male",
            LocalDate.of(1990, 1, 1),
            "native",
            "not_hispanic",
            "266",
            "");

    hl7Converter.populatePatientIdentification(pid, patientReportInput);

    assertThat(pid.getPid13_PhoneNumberHome(0).getXtn4_EmailAddress().getValue())
        .isEqualTo("john@example.com");
  }

  @Test
  void populateName_valid() throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    var patientName = pid.getPid5_PatientName(0);

    hl7Converter.populateName(patientName, "John", "Jacob", "Smith", "Jr");

    assertThat(patientName.getXpn1_FamilyName().getFn1_Surname().getValue()).isEqualTo("Smith");
    assertThat(patientName.getXpn2_GivenName().getValue()).isEqualTo("John");
    assertThat(patientName.getXpn3_SecondAndFurtherGivenNamesOrInitialsThereof().getValue())
        .isEqualTo("Jacob");
    assertThat(patientName.getXpn4_SuffixEgJRorIII().getValue()).isEqualTo("Jr");
  }

  private static Stream<Arguments> administrativeSexArgs() {
    return Stream.of(
        arguments("", "U"),
        arguments("male", "M"),
        arguments("female", "F"),
        arguments("other", "U"));
  }

  @ParameterizedTest
  @MethodSource("administrativeSexArgs")
  void populateAdministrativeSex_valid(String patientSex, String expectedIdentifier)
      throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    var administrativeSexCodedValue = pid.getPid8_AdministrativeSex();

    hl7Converter.populateAdministrativeSex(administrativeSexCodedValue, patientSex);

    assertThat(administrativeSexCodedValue.getValue()).isEqualTo(expectedIdentifier);
  }

  private static Stream<Arguments> raceArgs() {
    return Stream.of(
        arguments("native", "1002-5", "American Indian or Alaska Native", "HL70005"),
        arguments("black", "2054-5", "Black or African American", "HL70005"),
        arguments("refused", null, null, null),
        arguments("Fishpeople", null, null, null));
  }

  @ParameterizedTest
  @MethodSource("raceArgs")
  void populateRace_valid(
      String race, String expectedIdentifier, String expectedText, String codeSystem)
      throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    var raceCodedElement = pid.getPid10_Race(0);

    hl7Converter.populateRace(raceCodedElement, race);

    assertThat(raceCodedElement.getCe1_Identifier().getValue()).isEqualTo(expectedIdentifier);
    assertThat(raceCodedElement.getCe2_Text().getValue()).isEqualTo(expectedText);
    assertThat(raceCodedElement.getCe3_NameOfCodingSystem().getValue()).isEqualTo(codeSystem);
  }

  private static Stream<Arguments> ethnicityArgs() {
    return Stream.of(
        arguments("hispanic", "H", "Hispanic or Latino", "HL70189"),
        arguments("not_hispanic", "N", "Not Hispanic or Latino", "HL70189"),
        arguments("refused", "U", "unknown", "HL70189"),
        arguments("shark", "U", "unknown", "HL70189"));
  }

  @ParameterizedTest
  @MethodSource("ethnicityArgs")
  void populateEthnicGroup_valid(
      String ethnicity, String ethnicityIdentifier, String ethnicityText, String codeSystem)
      throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    var ethnicGroupCodedElement = pid.getPid22_EthnicGroup(0);

    hl7Converter.populateEthnicGroup(ethnicGroupCodedElement, ethnicity);

    assertThat(ethnicGroupCodedElement.getCe1_Identifier().getValue())
        .isEqualTo(ethnicityIdentifier);
    assertThat(ethnicGroupCodedElement.getCe2_Text().getValue()).isEqualTo(ethnicityText);
    assertThat(ethnicGroupCodedElement.getCe3_NameOfCodingSystem().getValue())
        .isEqualTo(codeSystem);
  }

  @Test
  void populatePhoneNumber_valid() throws DataTypeException {
    PID pid = TestDataBuilder.createPatientIdentificationSegment();
    XTN xtn = pid.getPid13_PhoneNumberHome(0);

    hl7Converter.populatePhoneNumber(xtn, "(716) 555-1234");

    assertThat(xtn.getXtn6_AreaCityCode().getValue()).isEqualTo("716");
    assertThat(xtn.getXtn7_LocalNumber().getValue()).isEqualTo("5551234");
  }

  @Test
  void populatePhoneNumber_throwsExceptionFor_NotMatching10Digits() {
    PID pid = TestDataBuilder.createPatientIdentificationSegment();
    XTN xtn = pid.getPid13_PhoneNumberHome(0);

    assertThrows(
        IllegalArgumentException.class, () -> hl7Converter.populatePhoneNumber(xtn, "16-555-1234"));
    assertThrows(
        IllegalArgumentException.class,
        () -> hl7Converter.populatePhoneNumber(xtn, "7716-555-1234"));
  }

  @Test
  void populatePhoneNumber_empty() throws DataTypeException {
    PID pid = TestDataBuilder.createPatientIdentificationSegment();
    XTN xtn = pid.getPid13_PhoneNumberHome(0);

    hl7Converter.populatePhoneNumber(xtn, "");

    assertThat(xtn.getXtn6_AreaCityCode().getValue()).isEqualTo(null);
    assertThat(xtn.getXtn7_LocalNumber().getValue()).isEqualTo(null);
  }

  @Test
  void populateExtendedAddress_valid() throws DataTypeException {
    PID pid = new ORU_R01().getPATIENT_RESULT().getPATIENT().getPID();
    XAD address = pid.getPid11_PatientAddress(0);

    hl7Converter.populateExtendedAddress(
        address, "123 Main St", "Apartment A", "Buffalo", "NY", "14220", "USA");

    assertThat(address.getXad1_StreetAddress().getSad1_StreetOrMailingAddress().getValue())
        .isEqualTo("123 Main St");
    assertThat(address.getXad2_OtherDesignation().getValue()).isEqualTo("Apartment A");
    assertThat(address.getXad3_City().getValue()).isEqualTo("Buffalo");
    assertThat(address.getXad4_StateOrProvince().getValue()).isEqualTo("NY");
    assertThat(address.getXad5_ZipOrPostalCode().getValue()).isEqualTo("14220");
    assertThat(address.getXad6_Country().getValue()).isEqualTo("USA");
  }

  @Test
  void populateOrderingProvider_valid() throws DataTypeException {
    XCN orderingProvider =
        new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION(0).getORC().getOrderingProvider(0);
    ProviderReportInput providerInput = TestDataBuilder.createProviderReportInput();

    hl7Converter.populateOrderingProvider(orderingProvider, providerInput);

    assertThat(orderingProvider.getXcn1_IDNumber().getValue()).isEqualTo(providerInput.getNpi());
    assertThat(orderingProvider.getXcn2_FamilyName().getFn1_Surname().getValue())
        .isEqualTo(providerInput.getLastName());
    assertThat(orderingProvider.getXcn3_GivenName().getValue())
        .isEqualTo(providerInput.getFirstName());
    assertThat(orderingProvider.getXcn4_SecondAndFurtherGivenNamesOrInitialsThereof().getValue())
        .isEqualTo(providerInput.getMiddleName());
    assertThat(orderingProvider.getXcn5_SuffixEgJRorIII().getValue()).isEqualTo("");
  }

  @Test
  void populateCommonOrderSegment_throwsExceptionFor_BlankFacilityPhoneAndEmail() {
    ORC orc = new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION().getORC();
    ProviderReportInput orderingProvider = TestDataBuilder.createProviderReportInput();
    FacilityReportInput orderingFacility =
        new FacilityReportInput(
            "Dracula Medical",
            "12D1234567",
            "123 Main St",
            "Suite 100",
            "Buffalo",
            "Erie",
            "NY",
            "14220",
            "",
            "");

    IllegalArgumentException exception =
        assertThrows(
            IllegalArgumentException.class,
            () ->
                hl7Converter.populateCommonOrderSegment(
                    orc, orderingFacility, orderingProvider, "123"));
    assertThat(exception.getMessage())
        .isEqualTo(
            "Ordering facility must contain at least phone number or email address for ORC-23");
  }

  @Test
  void populateCommonOrderSegment_valid_facilityEmailWithoutPhone() throws DataTypeException {
    ORC orc = new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION().getORC();
    ProviderReportInput orderingProvider = TestDataBuilder.createProviderReportInput();
    FacilityReportInput orderingFacility =
        new FacilityReportInput(
            "Dracula Medical",
            "12D1234567",
            "123 Main St",
            "Suite 100",
            "Buffalo",
            "Erie",
            "NY",
            "14220",
            "",
            "dracula@example.com");

    hl7Converter.populateCommonOrderSegment(orc, orderingFacility, orderingProvider, "123");

    assertThat(orc.getOrc23_OrderingFacilityPhoneNumber(0).getEmailAddress().getValue())
        .isEqualTo("dracula@example.com");
  }

  @Test
  void populateObservationRequest_valid() throws DataTypeException {
    OBR observationRequest = new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION(0).getOBR();
    ProviderReportInput providerInput = TestDataBuilder.createProviderReportInput();
    String testOrderLoinc = "12345";
    String testOrderDisplay = "Test order display";

    Instant specimenCollectionDate =
        LocalDate.of(2025, 6, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
    String expectedSpecimenCollectionDate = "20250601000000.0000+0000";

    hl7Converter.populateObservationRequest(
        observationRequest,
        1,
        STATIC_RANDOM_UUID,
        providerInput,
        Date.from(specimenCollectionDate),
        testOrderLoinc,
        testOrderDisplay,
        "F",
        Date.from(STATIC_INSTANT));

    assertThat(
            observationRequest.getObr4_UniversalServiceIdentifier().getCe1_Identifier().getValue())
        .isEqualTo(testOrderLoinc);
    assertThat(observationRequest.getObr4_UniversalServiceIdentifier().getCe2_Text().getValue())
        .isEqualTo(testOrderDisplay);
    assertThat(
            observationRequest
                .getObr4_UniversalServiceIdentifier()
                .getCe3_NameOfCodingSystem()
                .getValue())
        .isEqualTo("LN");

    assertThat(observationRequest.getObr7_ObservationDateTime().getTs1_Time().getValue())
        .isEqualTo(expectedSpecimenCollectionDate);
    assertThat(observationRequest.getObr8_ObservationEndDateTime().getTs1_Time().getValue())
        .isEqualTo(expectedSpecimenCollectionDate);
    assertThat(observationRequest.getObr22_ResultsRptStatusChngDateTime().getTs1_Time().getValue())
        .isEqualTo(STATIC_INSTANT_HL7_STRING);
  }

  @Test
  void populateObservationResult_valid() throws DataTypeException {
    OBX observationResult =
        new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION(0).getOBSERVATION().getOBX();

    Instant specimenCollectionDate =
        LocalDate.of(2025, 6, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
    String expectedSpecimenCollectionDate = "20250601000000.0000+0000";

    Instant testResultDate = LocalDate.of(2025, 7, 2).atStartOfDay().toInstant(ZoneOffset.UTC);
    String expectedTestResultDate = "20250702000000.0000+0000";

    FacilityReportInput performingFacility = TestDataBuilder.createFacilityReportInput();
    TestDetailsInput testDetail =
        new TestDetailsInput(
            "105629000",
            "87949-4",
            "Chlamydia trachomatis DNA [Presence] in Tissue by NAA with probe detection",
            "87949-4",
            "Chlamydia trachomatis DNA [Presence] in Tissue by NAA with probe detection",
            ResultScaleType.ORDINAL,
            "260373001",
            Date.from(testResultDate),
            "",
            "");

    hl7Converter.populateObservationResult(
        observationResult, 1, performingFacility, Date.from(specimenCollectionDate), testDetail);

    assertThat(observationResult.getObx3_ObservationIdentifier().getCe1_Identifier().getValue())
        .isEqualTo(testDetail.getTestOrderLoinc());
    assertThat(observationResult.getObx3_ObservationIdentifier().getCe2_Text().getValue())
        .isEqualTo(testDetail.getTestOrderDisplayName());

    assertThat(observationResult.getObx2_ValueType().getValue()).isEqualTo("CE");
    CE observationValue = (CE) observationResult.getObx5_ObservationValue(0).getData();
    assertThat(observationValue.getCe1_Identifier().getValue())
        .isEqualTo(testDetail.getResultValue());
    assertThat(observationValue.getCe3_NameOfCodingSystem().getValue()).isEqualTo("SNM");

    assertThat(observationResult.getObx14_DateTimeOfTheObservation().getTs1_Time().getValue())
        .isEqualTo(expectedSpecimenCollectionDate);

    assertThat(observationResult.getObx19_DateTimeOfTheAnalysis().getTs1_Time().getValue())
        .isEqualTo(expectedTestResultDate);
  }

  @Test
  void populateObservationResult_throwsExceptionFor_nonOrdinalResultTypes() {
    OBX observationResult =
        new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION(0).getOBSERVATION().getOBX();

    FacilityReportInput performingFacility = TestDataBuilder.createFacilityReportInput();
    TestDetailsInput testDetail =
        new TestDetailsInput(
            "105629000",
            "87949-4",
            "Chlamydia trachomatis DNA [Presence] in Tissue by NAA with probe detection",
            "87949-4",
            "Chlamydia trachomatis DNA [Presence] in Tissue by NAA with probe detection",
            ResultScaleType.NOMINAL,
            "260373001",
            Date.from(STATIC_INSTANT),
            "",
            "");

    IllegalArgumentException exception =
        assertThrows(
            IllegalArgumentException.class,
            () ->
                hl7Converter.populateObservationResult(
                    observationResult,
                    1,
                    performingFacility,
                    Date.from(STATIC_INSTANT),
                    testDetail));
    assertThat(exception.getMessage())
        .isEqualTo("Non-ordinal result types are not currently supported");
  }

  @Test
  void populateSpecimen_valid() throws DataTypeException {
    SPM specimen =
        new ORU_R01().getPATIENT_RESULT().getORDER_OBSERVATION(0).getSPECIMEN(0).getSPM();

    Instant specimenCollectionDate =
        LocalDate.of(2025, 6, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
    String expectedSpecimenCollectionDate = "20250601000000.0000+0000";

    Instant specimenReceivedDate =
        LocalDate.of(2025, 7, 2).atStartOfDay().toInstant(ZoneOffset.UTC);
    String expectedSpecimenReceivedDate = "20250702000000.0000+0000";

    SpecimenInput specimenInput =
        new SpecimenInput(
            "258479004",
            "Interstitial fluid specimen",
            Date.from(specimenCollectionDate),
            Date.from(specimenReceivedDate),
            "Body tissue structure",
            "85756007");

    hl7Converter.populateSpecimen(specimen, 1, STATIC_RANDOM_UUID, specimenInput);

    assertThat(
            specimen
                .getSpm2_SpecimenID()
                .getEip1_PlacerAssignedIdentifier()
                .getEi1_EntityIdentifier()
                .getValue())
        .isEqualTo(STATIC_RANDOM_UUID);
    assertThat(
            specimen
                .getSpm2_SpecimenID()
                .getEip2_FillerAssignedIdentifier()
                .getEi1_EntityIdentifier()
                .getValue())
        .isEqualTo(STATIC_RANDOM_UUID);

    assertThat(
            specimen
                .getSpm17_SpecimenCollectionDateTime()
                .getDr1_RangeStartDateTime()
                .getTs1_Time()
                .getValue())
        .isEqualTo(expectedSpecimenCollectionDate);
    assertThat(
            specimen
                .getSpm17_SpecimenCollectionDateTime()
                .getDr2_RangeEndDateTime()
                .getTs1_Time()
                .getValue())
        .isEqualTo(expectedSpecimenCollectionDate);

    assertThat(specimen.getSpm18_SpecimenReceivedDateTime().getTs1_Time().getValue())
        .isEqualTo(expectedSpecimenReceivedDate);
  }
}
