package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.CsvExportService.ExportParameters;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
class CsvExportServiceTest {

  @Mock private ResultService resultService;

  @InjectMocks private CsvExportService csvExportService;

  private ExportParameters facilityExportParams;
  private ExportParameters organizationExportParams;
  private Facility mockFacility;
  private Person mockPerson;
  private DeviceType mockDeviceType;
  private ApiUser mockApiUser;
  private AskOnEntrySurvey mockSurvey;

  @BeforeEach
  void setUp() {
    mockFacility = createMockFacility();
    mockPerson = createMockPerson();
    mockDeviceType = createMockDeviceType();
    mockApiUser = createMockApiUser();
    mockSurvey = createMockSurveyData();

    facilityExportParams =
        new ExportParameters(UUID.randomUUID(), null, null, null, null, null, null, 0, 100);

    organizationExportParams =
        new ExportParameters(null, null, null, null, null, null, null, 0, 100);
  }

  @Test
  void streamResultsAsCsv_withFacilityExport_shouldGenerateCsvSuccessfully() {
    Result mockResult = createMockResult();
    Page<Result> mockPage = new PageImpl<>(List.of(mockResult));
    when(resultService.getFacilityResults(
            eq(facilityExportParams.facilityId()),
            any(),
            any(),
            any(),
            any(),
            any(),
            any(),
            anyInt(),
            anyInt()))
        .thenReturn(mockPage);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    assertDoesNotThrow(
        () -> csvExportService.streamResultsAsCsv(outputStream, facilityExportParams));

    String csvContent = outputStream.toString();
    assertThat(csvContent).isNotEmpty();
    assertThat(csvContent).contains("Patient first name");
    assertThat(csvContent).contains("Test date");
    assertThat(csvContent).contains("Result");
    assertThat(csvContent).contains("John");
    assertThat(csvContent).contains("Doe");
    assertThat(csvContent).contains("POSITIVE");
    assertThat(csvContent).contains("Test Facility");
  }

  @Test
  void streamResultsAsCsv_withOrganizationExport_shouldGenerateCsvSuccessfully() {
    Result mockResult = createMockResult();
    Page<Result> mockPage = new PageImpl<>(List.of(mockResult));
    when(resultService.getOrganizationResults(
            any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
        .thenReturn(mockPage);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    assertDoesNotThrow(
        () -> csvExportService.streamResultsAsCsv(outputStream, organizationExportParams));

    String csvContent = outputStream.toString();
    assertThat(csvContent).isNotEmpty();
    assertThat(csvContent).contains("Patient first name");
    assertThat(csvContent).contains("Test date");
    assertThat(csvContent).contains("Result");
    assertThat(csvContent).contains("John");
    assertThat(csvContent).contains("Doe");
    assertThat(csvContent).contains("POSITIVE");
    assertThat(csvContent).contains("COVID-19");
    assertThat(csvContent).contains("john.doe@example.com");
  }

  @Test
  void streamResultsAsZippedCsv_withOrganizationExport_shouldGenerateZipSuccessfully()
      throws IOException {
    Result mockResult = createMockResult();
    Page<Result> mockPage = new PageImpl<>(List.of(mockResult));
    when(resultService.getOrganizationResults(
            any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
        .thenReturn(mockPage);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    assertDoesNotThrow(
        () -> csvExportService.streamResultsAsZippedCsv(outputStream, organizationExportParams));

    byte[] zipBytes = outputStream.toByteArray();
    assertThat(zipBytes).isNotEmpty();

    try (ZipInputStream zipInputStream =
        new ZipInputStream(new java.io.ByteArrayInputStream(zipBytes))) {
      var entry = zipInputStream.getNextEntry();
      assertThat(entry).isNotNull();
      assertThat(entry.getName()).isEqualTo("test-results.csv");

      byte[] csvBytes = zipInputStream.readAllBytes();
      String csvContent = new String(csvBytes);
      assertThat(csvContent).contains("Patient first name");
      assertThat(csvContent).contains("John");
      assertThat(csvContent).contains("Doe");
      assertThat(csvContent).contains("POSITIVE");
      assertThat(csvContent).contains("123 Main St");
      assertThat(csvContent).contains("555-1234");
    }
  }

  private Facility createMockFacility() {
    Facility facility = mock(Facility.class);
    when(facility.getFacilityName()).thenReturn("Test Facility");
    when(facility.getIsDeleted()).thenReturn(false);
    return facility;
  }

  private Person createMockPerson() {
    Person person = mock(Person.class);

    when(person.getFirstName()).thenReturn("John");
    when(person.getMiddleName()).thenReturn("Michael");
    when(person.getLastName()).thenReturn("Doe");
    when(person.getBirthDate()).thenReturn(LocalDate.of(1990, 1, 15));
    when(person.getRole()).thenReturn(PersonRole.STUDENT);
    when(person.getLookupId()).thenReturn("STU123");
    when(person.getPreferredLanguage()).thenReturn("English");
    when(person.getEmail()).thenReturn("john.doe@example.com");
    when(person.getStreet()).thenReturn("123 Main St");
    when(person.getStreetTwo()).thenReturn("Apt 4B");
    when(person.getCity()).thenReturn("Anytown");
    when(person.getState()).thenReturn("NY");
    when(person.getZipCode()).thenReturn("12345");
    when(person.getCounty()).thenReturn("Test County");
    when(person.getCountry()).thenReturn("USA");
    when(person.getGender()).thenReturn("M");
    when(person.getRace()).thenReturn("White");
    when(person.getEthnicity()).thenReturn("Not Hispanic");
    when(person.getTribalAffiliation()).thenReturn(List.of("Cherokee"));
    when(person.getResidentCongregateSetting()).thenReturn(false);
    when(person.getEmployedInHealthcare()).thenReturn(false);

    PhoneNumber phoneNumber = mock(PhoneNumber.class);
    when(phoneNumber.getNumber()).thenReturn("555-1234");
    when(person.getPhoneNumbers()).thenReturn(List.of(phoneNumber));

    return person;
  }

  private DeviceType createMockDeviceType() {
    DeviceType deviceType = mock(DeviceType.class);
    when(deviceType.getName()).thenReturn("Abbott BinaxNOW");
    when(deviceType.getManufacturer()).thenReturn("Abbott");
    when(deviceType.getModel()).thenReturn("BinaxNOW COVID-19 Ag Card");
    when(deviceType.getSwabTypes()).thenReturn(List.of());
    return deviceType;
  }

  private ApiUser createMockApiUser() {
    ApiUser apiUser = mock(ApiUser.class);
    PersonName submitterName = new PersonName("Test", "", "Submitter", "");
    when(apiUser.getNameInfo()).thenReturn(submitterName);
    return apiUser;
  }

  private AskOnEntrySurvey createMockSurveyData() {
    AskOnEntrySurvey survey = mock(AskOnEntrySurvey.class);
    when(survey.getNoSymptoms()).thenReturn(false);
    when(survey.getSymptomsJSON()).thenReturn("{\"fever\":true,\"cough\":false}");
    when(survey.getSymptomOnsetDate()).thenReturn(LocalDate.now().minusDays(2));
    return survey;
  }

  private Result createMockResult() {
    Result result = mock(Result.class);
    TestEvent event = mock(TestEvent.class);
    SupportedDisease disease = mock(SupportedDisease.class);

    when(result.getTestEvent()).thenReturn(event);
    when(result.getUpdatedAt())
        .thenReturn(Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()));
    when(result.getDisease()).thenReturn(disease);
    when(result.getTestResult()).thenReturn(TestResult.POSITIVE);

    when(event.getInternalId()).thenReturn(UUID.randomUUID());
    when(event.getFacility()).thenReturn(mockFacility);
    when(event.getPatient()).thenReturn(mockPerson);
    when(event.getDateTested())
        .thenReturn(Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()));
    when(event.getDeviceType()).thenReturn(mockDeviceType);
    when(event.getCorrectionStatus()).thenReturn(null);
    when(event.getReasonForCorrection()).thenReturn(null);
    when(event.getCreatedBy()).thenReturn(mockApiUser);
    when(event.getSurveyData()).thenReturn(mockSurvey);
    when(event.getTestOrderId()).thenReturn(UUID.randomUUID());

    when(disease.getName()).thenReturn("COVID-19");

    return result;
  }
}
