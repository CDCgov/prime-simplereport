package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.service.CsvExportService.ExportParameters;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Set;
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
  @Mock private PersonService personService;

  @Mock private OrganizationService organizationService;

  @Mock private FacilityRepository facilityRepository;
  @Mock private PersonRepository personRepository;

  @InjectMocks private CsvExportService csvExportService;

  private ExportParameters facilityExportParams;
  private ExportParameters organizationExportParams;
  private Organization mockOrganization;
  private Facility mockFacility;
  private Person mockPerson;
  private DeviceType mockDeviceType;
  private ApiUser mockApiUser;
  private AskOnEntrySurvey mockSurvey;

  @BeforeEach
  void setUp() {
    mockOrganization = createMockOrganization();
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

  @Test
  void streamPatientsAsCsv_withFacilityDownload_shouldGenerateCsvSuccessfully() {
    List<Person> mockPersons = List.of(mockPerson);
    when(personService.getPatients(any(), anyInt(), anyInt(), any(), any(), any(), any()))
        .thenReturn(mockPersons);

    when(facilityRepository.findAllByOrganizationAndDeleted(any(), anyBoolean()))
        .thenReturn(Set.of(mockFacility));
    when(personRepository.findByInternalIdIn(any())).thenReturn(mockPersons);
    when(personService.getPatientsCount(any(), any(), any(), anyBoolean(), any())).thenReturn(1L);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    assertDoesNotThrow(
        () ->
            csvExportService.streamFacilityPatientsAsCsv(
                outputStream, mockFacility.getInternalId()));

    String csvContent = outputStream.toString();
    assertThat(csvContent).isNotEmpty();
    assertThat(csvContent)
        .contains(
            "First name,Middle name,Last name,Suffix,Birth date,Street address 1,Street address 2,City,County,State,Postal code,Country,Phone numbers,Emails,Race,Sex,Ethnicity,Role,Facilities,Employed in healthcare?,Group or shared housing resident?,Tribal affiliation,Preferred language,Notes");
    assertThat(csvContent)
        .contains(
            "John,Michael,Doe,,01/15/1990,123 Main St,Apt 4B,Anytown,Test County,NY,12345,USA,555-1234,john.doe@example.com,White,M,Not Hispanic,STUDENT,Test Facility,false,false,Cherokee,English,");
  }

  @Test
  void streamPatientsAsCsv_withOrganizationDownload_shouldGenerateCsvSuccessfully() {
    List<Person> mockPersons = List.of(mockPerson);

    when(personRepository.findAllByOrganizationAndIsDeleted(any(), anyBoolean(), any()))
        .thenReturn(mockPersons);

    when(facilityRepository.findAllByOrganizationAndDeleted(any(), anyBoolean()))
        .thenReturn(Set.of(mockFacility));
    when(personRepository.findByInternalIdIn(any())).thenReturn(mockPersons);

    when(personService.getPatientsCountByOrganization(any())).thenReturn(1L);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    assertDoesNotThrow(
        () ->
            csvExportService.streamOrganizationPatientsAsCsv(
                outputStream, mockOrganization.getInternalId()));

    String csvContent = outputStream.toString();
    assertThat(csvContent).isNotEmpty();
    assertThat(csvContent)
        .contains(
            "First name,Middle name,Last name,Suffix,Birth date,Street address 1,Street address 2,City,County,State,Postal code,Country,Phone numbers,Emails,Race,Sex,Ethnicity,Role,Facilities,Employed in healthcare?,Group or shared housing resident?,Tribal affiliation,Preferred language,Notes");
    assertThat(csvContent)
        .contains(
            "John,Michael,Doe,,01/15/1990,123 Main St,Apt 4B,Anytown,Test County,NY,12345,USA,555-1234,john.doe@example.com,White,M,Not Hispanic,STUDENT,Test Facility,false,false,Cherokee,English,");
  }

  private Organization createMockOrganization() {
    return mock(Organization.class);
  }

  private Facility createMockFacility() {
    Facility facility = mock(Facility.class);
    when(facility.getFacilityName()).thenReturn("Test Facility");
    return facility;
  }

  private Person createMockPerson() {
    Person person = mock(Person.class);

    when(person.getFirstName()).thenReturn("John");
    when(person.getMiddleName()).thenReturn("Michael");
    when(person.getLastName()).thenReturn("Doe");
    when(person.getBirthDate()).thenReturn(LocalDate.of(1990, 1, 15));
    when(person.getRole()).thenReturn(PersonRole.STUDENT);
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
    return mock(DeviceType.class);
  }

  private ApiUser createMockApiUser() {
    return mock(ApiUser.class);
  }

  private AskOnEntrySurvey createMockSurveyData() {
    return mock(AskOnEntrySurvey.class);
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
