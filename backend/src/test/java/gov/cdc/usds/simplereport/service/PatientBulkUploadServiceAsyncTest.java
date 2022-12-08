package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

/*
 * We can't use the standard BaseServiceTest here because this service is async and requires a request context to operate.
 * BaseFullStackTest doesn't have the authorization setup required for an authenticated test, but BaseGraphqlTest does.
 */
@TestPropertySource(
    properties = {
      "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
@SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser
public class PatientBulkUploadServiceAsyncTest extends BaseGraphqlTest {

  @Autowired PatientBulkUploadServiceAsync _service;
  @Autowired PersonService _personService;
  @Autowired PhoneNumberRepository phoneNumberRepository;

  public static final int PATIENT_PAGE_OFFSET = 0;
  public static final int PATIENT_PAGE_SIZE = 1000;

  @MockBean private EmailService _emailService;
  @SpyBean private PersonRepository personRepository;

  private UUID firstFacilityId;
  private UUID secondFacilityId;

  @BeforeEach
  void setupData() {
    reset(personRepository);
    List<UUID> facilityIds =
        _orgService.getFacilities(_orgService.getCurrentOrganization()).stream()
            .map(Facility::getInternalId)
            .collect(Collectors.toList());
    if (facilityIds.isEmpty()) {
      throw new IllegalStateException("This organization has no facilities");
    }
    firstFacilityId = facilityIds.get(0);
    secondFacilityId = facilityIds.get(1);
  }

  @Test
  void validPerson_savedToDatabase() throws IOException, ExecutionException, InterruptedException {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    // WHEN
    CompletableFuture<Set<Person>> futureSavedPatients = this._service.savePatients(content, null);
    Set<Person> savedPatients = futureSavedPatients.get();

    // THEN
    assertThat(savedPatients.size()).isEqualTo(fetchDatabasePatients().size());
    assertThat(fetchDatabasePatientsForFacility(firstFacilityId))
        .hasSameSizeAs(fetchDatabasePatientsForFacility(secondFacilityId));
    assertThat(fetchDatabasePatients()).hasSize(1);

    Person patient = fetchDatabasePatients().get(0);

    assertThat(patient.getLastName()).isEqualTo("Doe");
    assertThat(patient.getRace()).isEqualTo("black");
    assertThat(patient.getEthnicity()).isEqualTo("not_hispanic");
    assertThat(patient.getBirthDate()).isEqualTo(LocalDate.of(1980, 11, 3));
    assertThat(patient.getGender()).isEqualTo("female");
    assertThat(patient.getRole()).isEqualTo(PersonRole.STAFF);

    assertThat(patient.getCountry()).isEqualTo("USA");

    List<PhoneNumber> phoneNumbers =
        phoneNumberRepository.findAllByPersonInternalId(patient.getInternalId());
    assertThat(phoneNumbers).hasSize(1);
    PhoneNumber phoneNumber = phoneNumbers.get(0);
    assertThat(phoneNumber.getNumber()).isEqualTo("410-867-5309");
    assertThat(phoneNumber.getType()).isEqualTo(PhoneType.MOBILE);
    assertThat(patient.getEmail()).isEqualTo("jane@testingorg.com");

    verify(_emailService, times(1))
        .sendWithDynamicTemplate(
            eq(List.of("bobbity@example.com")),
            eq(EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD),
            eq(Map.of("patients_url", "https://simplereport.gov/patients?facility=null")));
  }

  @Test
  void noPhoneNumberTypes_savesPatient()
      throws IOException, ExecutionException, InterruptedException {
    // WHEN
    InputStream inputStream = loadCsv("patientBulkUpload/noPhoneNumberTypes.csv");
    byte[] content = inputStream.readAllBytes();

    CompletableFuture<Set<Person>> futurePatients = this._service.savePatients(content, null);
    futurePatients.get();

    // THEN
    assertThat(fetchDatabasePatients()).hasSize(1);
  }

  @Test
  void duplicatePatient_isNotSaved() throws IOException, ExecutionException, InterruptedException {
    // GIVEN
    _personService.addPatient(
        firstFacilityId,
        "",
        "Jane",
        "",
        "Doe",
        "",
        LocalDate.of(1980, 11, 3),
        _dataFactory.getAddress(),
        "USA",
        List.of(new PhoneNumber(parsePhoneType("mobile"), "410-867-5309")),
        PersonRole.STAFF,
        List.of("jane@testingorg.com"),
        "black",
        "not_hispanic",
        null,
        "female",
        false,
        false,
        "",
        null);
    assertThat(fetchDatabasePatients()).hasSize(1);

    // WHEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();
    CompletableFuture<Set<Person>> futurePatients = this._service.savePatients(content, null);
    futurePatients.get();

    // THEN
    assertThat(fetchDatabasePatients()).hasSize(1);
  }

  @Test
  void duplicatePatientInCsv_isNotAddedToBatch()
      throws IOException, ExecutionException, InterruptedException {
    // WHEN
    InputStream inputStream = loadCsv("patientBulkUpload/duplicatePatients.csv");
    byte[] content = inputStream.readAllBytes();
    CompletableFuture<Set<Person>> futurePatients = this._service.savePatients(content, null);
    futurePatients.get();

    // THEN
    assertThat(fetchDatabasePatients()).hasSize(1);
  }

  @Test
  void patientSavedToSingleFacility_successful()
      throws IOException, ExecutionException, InterruptedException {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    // WHEN
    CompletableFuture<Set<Person>> futurePatients =
        this._service.savePatients(content, firstFacilityId);
    futurePatients.get();

    // THEN
    assertThat(fetchDatabasePatientsForFacility(firstFacilityId)).hasSize(1);
    assertThat(fetchDatabasePatientsForFacility(secondFacilityId)).isEmpty();
  }

  @Test
  void invalidData_throwsExceptionAndTriggersErrorEmail()
      throws IOException, ExecutionException, InterruptedException {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/missingRequiredFields.csv");
    byte[] content = inputStream.readAllBytes();

    // WHEN
    CompletableFuture<Set<Person>> futurePatients =
        this._service.savePatients(content, firstFacilityId);

    // THEN
    assertThrows(ExecutionException.class, futurePatients::get);
    assertThat(fetchDatabasePatients()).isEmpty();

    verify(_emailService, times(1))
        .sendWithDynamicTemplate(
            eq(List.of("bobbity@example.com")),
            eq(EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD_ERROR),
            eq(Map.of("simplereport_url", "https://simplereport.gov/")));
  }

  @Test
  void shouldSendErrorEmail_whenPersonSaveAllFails()
      throws IOException, ExecutionException, InterruptedException {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    doThrow(IllegalArgumentException.class).when(personRepository).saveAll(any());

    // WHEN
    CompletableFuture<Set<Person>> futurePatients =
        this._service.savePatients(content, firstFacilityId);

    // THEN
    assertThrows(ExecutionException.class, futurePatients::get);

    verify(_emailService, times(1))
        .sendWithDynamicTemplate(
            eq(List.of("bobbity@example.com")),
            eq(EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD_ERROR),
            eq(Map.of("simplereport_url", "https://simplereport.gov/")));
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void requiresPermissionAddPatientsToFacility()
      throws IOException, ExecutionException, InterruptedException {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    // WHEN
    CompletableFuture<Set<Person>> futurePatients =
        this._service.savePatients(content, secondFacilityId);
    ExecutionException caught = assertThrows(ExecutionException.class, futurePatients::get);
    assertThat(caught.getCause().getClass()).isEqualTo(AccessDeniedException.class);
  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadServiceAsyncTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  private List<Person> fetchDatabasePatients() {
    return this._personService.getPatients(
        null, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }

  private List<Person> fetchDatabasePatientsForFacility(UUID facilityId) {
    return this._personService.getPatients(
        facilityId, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }
}
