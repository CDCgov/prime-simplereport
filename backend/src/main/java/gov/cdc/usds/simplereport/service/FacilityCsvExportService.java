package gov.cdc.usds.simplereport.service;

import static org.apache.commons.lang3.StringUtils.trimToEmpty;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.ArchivedStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultsListItem;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class FacilityCsvExportService {
  private final ResultService resultService;
  private final PersonService personService;
  private final FacilityRepository facilityRepository;
  private static final int BATCH_SIZE = 10000;
  private final PersonRepository personRepository;
  private final OrganizationService organizationService;

  public record FacilityExportParameters(
      UUID facilityId,
      UUID patientId,
      TestResult testResult,
      PersonRole personRole,
      SupportedDisease disease,
      Date startDate,
      Date endDate,
      int pageNumber,
      int pageSize) {

    public void validate() {
      if (facilityId == null) {
        throw new IllegalArgumentException("facilityId is required for facility exports");
      }
    }
  }

  public void streamFacilityResultsAsCsv(
      OutputStream outputStream, FacilityExportParameters params) {
    params.validate();

    try (OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
        CSVPrinter csvPrinter = new CSVPrinter(writer, createCsvFormat())) {

      int totalElements = getFacilityResultsCount(params);
      int totalPages = (int) Math.ceil((double) totalElements / BATCH_SIZE);

      log.info(
          "Starting facility CSV export for facilityId={}: {} records in {} batches",
          params.facilityId(),
          totalElements,
          totalPages);

      for (int currentPage = 0; currentPage < totalPages; currentPage++) {
        Pageable pageable = PageRequest.of(currentPage, BATCH_SIZE);
        Page<TestResultsListItem> resultsPage = fetchFacilityResultsPage(params, pageable);

        log.info(
            "Page {}/{}: Expected {} records, Got {} records, Total so far: {}",
            (currentPage + 1),
            totalPages,
            BATCH_SIZE,
            resultsPage.getContent().size(),
            (currentPage * BATCH_SIZE) + resultsPage.getContent().size());
        for (TestResultsListItem item : resultsPage.getContent()) {
          writeCsvRow(csvPrinter, item);
        }

        csvPrinter.flush();
        log.debug("Processed batch {}/{} for facility CSV export", (currentPage + 1), totalPages);
      }

      log.info("Completed facility CSV export for facilityId={}", params.facilityId());
    } catch (IOException e) {
      log.error("Error streaming facility CSV data for facilityId={}", params.facilityId(), e);
      throw new RuntimeException("Failed to generate facility CSV file", e);
    }
  }

  @Transactional(readOnly = true)
  public void streamFacilityPatientsAsCsv(OutputStream outputStream, UUID facilityId) {
    //        params.validate();

    try (OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
        CSVPrinter csvPrinter = new CSVPrinter(writer, createPatientsCsvFormat())) {

      long facilityPatientsCount = getFacilityPatientsCount(facilityId);
      int totalPages = (int) Math.ceil((double) facilityPatientsCount / BATCH_SIZE);

      //      Organization currentOrg = organizationService.getOrganizationById(organizationId);
      //      String facilityList = facilityRepository
      //              .findAllByOrganizationAndDeleted(currentOrg, false)
      //              .stream()
      //              .map(Facility::getFacilityName)
      //              .collect(Collectors.joining(";"));

      log.info(
          "Starting facility CSV patient export for facilityId={}: {} patient records in {} batches",
          facilityId,
          facilityPatientsCount,
          totalPages);

      // fetch facility name and all facilities in the org here? would cut down on querying the
      // facility
      // and org tables whenever we access those values in the writePatientCsvRow methode
      for (int currentPage = 0; currentPage < totalPages; currentPage++) {
        Pageable pageable = PageRequest.of(currentPage, BATCH_SIZE);
        List<Person> facilityPatients = fetchFacilityPatients(facilityId, pageable);

        log.info(
            "Page {}/{}: Expected {} patient records, Got {} patient records, Total so far: {}",
            (currentPage + 1),
            totalPages,
            BATCH_SIZE,
            facilityPatients.size(),
            (currentPage * BATCH_SIZE) + facilityPatients.size());
        //        for (Person patient : facilityPatients) {
        //          writePatientCsvRow(csvPrinter, patient);
        //        }

        csvPrinter.flush();
        log.debug("Processed batch {}/{} for facility CSV export", (currentPage + 1), totalPages);
      }

      log.info("Completed facility patient CSV export for facilityId={}", facilityId);
    } catch (IOException e) {
      log.error("Error streaming facility CSV data for facilityId={}", facilityId, e);
      throw new RuntimeException("Failed to generate facility CSV file", e);
    }
  }

  // fetch all facilities in the org here? would cut down on querying the facility
  // and org tables whenever we access those values in the writePatientCsvRow methode
  @Transactional(readOnly = true)
  public void streamOrganizationPatientsAsCsv(OutputStream outputStream, UUID organizationId) {

    try (OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
        CSVPrinter csvPrinter = new CSVPrinter(writer, createPatientsCsvFormat())) {

      long organizationPatientsCount = getOrganizationPatientsCount(organizationId);
      int totalPages = (int) Math.ceil((double) organizationPatientsCount / BATCH_SIZE);

      Organization currentOrg = organizationService.getOrganizationById(organizationId);
      String orgFacilityList =
          facilityRepository.findAllByOrganizationAndDeleted(currentOrg, false).stream()
              .map(Facility::getFacilityName)
              .collect(Collectors.joining(";"));

      log.info(
          "Starting organization CSV patient export for organizationId={}: {} patient records in {} batches",
          organizationId,
          organizationPatientsCount,
          totalPages);

      for (int currentPage = 0; currentPage < totalPages; currentPage++) {
        Pageable pageable = PageRequest.of(currentPage, BATCH_SIZE);
        List<Person> organizationPatients = fetchOrganizationPatients(organizationId, pageable);

        log.info(
            "Page {}/{}: Expected {} patient records, Got {} patient records, Total so far: {}",
            (currentPage + 1),
            totalPages,
            BATCH_SIZE,
            organizationPatients.size(),
            (currentPage * BATCH_SIZE) + organizationPatients.size());
        for (Person patient : organizationPatients) {
          writePatientCsvRow(csvPrinter, patient, orgFacilityList);
        }

        csvPrinter.flush();
        log.debug(
            "Processed batch {}/{} for organization CSV export", (currentPage + 1), totalPages);
      }

      log.info("Completed organization patient CSV export for organizationId={}", organizationId);
    } catch (IOException e) {
      log.error("Error streaming organization CSV data for organizationId={}", organizationId, e);
      throw new RuntimeException("Failed to generate organization CSV file", e);
    }
  }

  @Transactional(readOnly = true)
  public void streamFacilityPatientsAsZippedCsv(OutputStream rawOut, UUID facilityId) {

    class NonClosingOutputStream extends FilterOutputStream {
      NonClosingOutputStream(OutputStream out) {
        super(out);
      }

      @Override
      public void close() throws IOException {
        flush();
      }
    }

    try (ZipOutputStream zipOut = new ZipOutputStream(rawOut)) {
      zipOut.putNextEntry(new ZipEntry("facility-patient-data.csv"));

      streamFacilityPatientsAsCsv(new NonClosingOutputStream(zipOut), facilityId);

      zipOut.closeEntry();
    } catch (IOException ex) {
      log.error("Error zipping CSV for facility {}", facilityId, ex);
      throw new RuntimeException("Failed to generate zipped CSV", ex);
    }
  }

  @Transactional(readOnly = true)
  public void streamOrganizationPatientsAsZippedCsv(OutputStream rawOut, UUID organizationId) {

    class NonClosingOutputStream extends FilterOutputStream {
      NonClosingOutputStream(OutputStream out) {
        super(out);
      }

      @Override
      public void close() throws IOException {
        flush();
      }
    }

    try (ZipOutputStream zipOut = new ZipOutputStream(rawOut)) {
      zipOut.putNextEntry(new ZipEntry("organization-patient-data.csv"));

      streamOrganizationPatientsAsCsv(new NonClosingOutputStream(zipOut), organizationId);

      zipOut.closeEntry();
    } catch (IOException ex) {
      log.error("Error zipping CSV for organization {}", organizationId, ex);
      throw new RuntimeException("Failed to generate zipped CSV", ex);
    }
  }

  private int getFacilityResultsCount(FacilityExportParameters params) {
    Page<TestResultsListItem> countPage =
        resultService
            .getFacilityResults(
                params.facilityId(),
                params.patientId(),
                params.testResult(),
                params.personRole(),
                params.disease(),
                params.startDate(),
                params.endDate(),
                0,
                1)
            .map(TestResultsListItem::new);

    return (int) countPage.getTotalElements();
  }

  private long getFacilityPatientsCount(UUID facilityId) {
    return personService.getPatientsCount(facilityId, ArchivedStatus.UNARCHIVED, null, false, "");
  }

  private long getOrganizationPatientsCount(UUID organizationId) {
    return personService.getPatientsCountByOrganization(organizationId);
  }

  private Page<TestResultsListItem> fetchFacilityResultsPage(
      FacilityExportParameters params, Pageable pageable) {
    return resultService
        .getFacilityResults(
            params.facilityId(),
            params.patientId(),
            params.testResult(),
            params.personRole(),
            params.disease(),
            params.startDate(),
            params.endDate(),
            pageable.getPageNumber(),
            pageable.getPageSize())
        .map(TestResultsListItem::new);
  }

  private List<Person> fetchFacilityPatients(UUID facilityId, Pageable pageable) {
    return personService.getPatients(
        facilityId,
        pageable.getPageNumber(),
        pageable.getPageSize(),
        ArchivedStatus.UNARCHIVED,
        null,
        false,
        null);
  }

  private List<Person> fetchOrganizationPatients(UUID organizationInternalId, Pageable pageable) {

    return personRepository.findAllByOrganizationInternalIdAndIsDeleted(
        organizationInternalId, false, pageable);
    //    return personService.getPatients(
    //        null, // a null facility fetches all patients in the current org
    //        pageable.getPageNumber(),
    //        pageable.getPageSize(),
    //        ArchivedStatus.UNARCHIVED,
    //        null,
    //        false,
    //        null);
  }

  private CSVFormat createCsvFormat() {
    String[] headers = {
      "Patient first name",
      "Patient middle name",
      "Patient last name",
      "Patient full name",
      "Patient date of birth",
      "Test date",
      "Condition",
      "Result",
      "Result reported date",
      "Test correction status",
      "Test correction reason",
      "Device name",
      "Device manufacturer",
      "Device model",
      "Device swab type",
      "Has symptoms",
      "Symptoms present",
      "Symptom onset",
      "Facility name",
      "Submitter",
      "Patient role",
      "Patient ID (Student ID, Employee ID, etc.)",
      "Patient preferred language",
      "Patient phone number",
      "Patient email",
      "Patient street address",
      "Patient street address 2",
      "Patient city",
      "Patient state",
      "Patient zip code",
      "Patient county",
      "Patient country",
      "Patient gender",
      "Patient race",
      "Patient ethnicity",
      "Patient tribal affiliation",
      "Patient is a resident in a congregate setting",
      "Patient is employed in healthcare"
    };
    return CSVFormat.Builder.create().setHeader(headers).build();
  }

  private CSVFormat createPatientsCsvFormat() {
    String[] headers = {
      "First Name",
      "Middle Name",
      "Last Name",
      "Suffix",
      "Birth Date",
      "Street",
      "City",
      "County",
      "State",
      "Postal Code",
      "County",
      "Phone Numbers",
      "Emails",
      "Race",
      "Sex",
      "Ethnicity",
      "Role",
      "Facilities",
      "Employed in Healthcare?",
      "Group or Shared Housing Resident?",
      "Tribal Affiliation",
      "Preferred Language",
      "Notes"
    };
    return CSVFormat.Builder.create().setHeader(headers).build();
  }

  private void writeCsvRow(CSVPrinter csvPrinter, TestResultsListItem item) throws IOException {
    Person patient = item.getPatient();
    DeviceType deviceType = item.getDeviceType();
    Facility facility = item.getFacility();
    AskOnEntrySurvey surveyData = item.getSurveyData();
    ApiUser createdBy = item.getCreatedBy();

    String firstName =
        patient != null && patient.getFirstName() != null ? patient.getFirstName() : "";
    String middleName =
        patient != null && patient.getMiddleName() != null ? patient.getMiddleName() : "";
    String lastName = patient != null && patient.getLastName() != null ? patient.getLastName() : "";
    String fullName = formatFullName(firstName, middleName, lastName);

    String submitterName = "";
    if (createdBy != null && createdBy.getNameInfo() != null) {
      submitterName =
          formatFullName(
              createdBy.getNameInfo().getFirstName(),
              createdBy.getNameInfo().getMiddleName(),
              createdBy.getNameInfo().getLastName());
    }

    String facilityName =
        facility != null && facility.getFacilityName() != null
            ? formatFacilityName(facility.getFacilityName(), facility.getIsDeleted())
            : "";

    String hasSymptoms = "";
    if (surveyData != null) {
      hasSymptoms =
          formatHasSymptoms(
              surveyData.getNoSymptoms() != null ? surveyData.getNoSymptoms() : false,
              surveyData.getSymptomsJSON());
    }

    String symptomsPresent = "";
    if (surveyData != null) {
      symptomsPresent = formatSymptomsPresent(surveyData.getSymptomsJSON());
    }

    String swabType = "";
    if (deviceType != null
        && deviceType.getSwabTypes() != null
        && !deviceType.getSwabTypes().isEmpty()) {
      swabType = deviceType.getSwabTypes().get(0).getName();
    }

    String phoneNumber = "";
    if (patient != null
        && patient.getPhoneNumbers() != null
        && !patient.getPhoneNumbers().isEmpty()) {
      phoneNumber = patient.getPhoneNumbers().get(0).getNumber();
    }

    String tribalAffiliation = "";
    if (patient != null
        && patient.getTribalAffiliation() != null
        && !patient.getTribalAffiliation().isEmpty()) {
      tribalAffiliation = String.join(", ", patient.getTribalAffiliation());
    }

    csvPrinter.printRecord(
        firstName,
        middleName,
        lastName,
        fullName,
        formatAsDate(patient != null ? patient.getBirthDate() : null),
        formatAsDateTime(item.getDateTested()),
        item.getDisease(),
        item.getTestResult(),
        formatAsDateTime(item.getDateUpdated()),
        item.getCorrectionStatus() != null ? item.getCorrectionStatus().toString() : "",
        item.getReasonForCorrection(),
        deviceType != null ? deviceType.getName() : "",
        deviceType != null ? deviceType.getManufacturer() : "",
        deviceType != null ? deviceType.getModel() : "",
        swabType,
        hasSymptoms,
        symptomsPresent,
        formatAsDate(surveyData != null ? surveyData.getSymptomOnsetDate() : null),
        facilityName,
        submitterName,
        patient != null && patient.getRole() != null ? patient.getRole().toString() : "",
        patient != null ? patient.getLookupId() : "",
        patient != null ? patient.getPreferredLanguage() : "",
        phoneNumber,
        patient != null ? patient.getEmail() : "",
        patient != null ? patient.getStreet() : "",
        patient != null ? patient.getStreetTwo() : "",
        patient != null ? patient.getCity() : "",
        patient != null ? patient.getState() : "",
        patient != null ? patient.getZipCode() : "",
        patient != null ? patient.getCounty() : "",
        patient != null ? patient.getCountry() : "",
        patient != null && patient.getGender() != null ? patient.getGender() : "",
        patient != null && patient.getRace() != null ? patient.getRace() : "",
        patient != null && patient.getEthnicity() != null ? patient.getEthnicity() : "",
        tribalAffiliation,
        patient != null ? patient.getResidentCongregateSetting() : "",
        patient != null ? patient.getEmployedInHealthcare() : "");
  }

  private void writePatientCsvRow(CSVPrinter csvPrinter, Person patient, String orgFacilityList)
      throws IOException {
    //                "First Name",
    //                "Middle Name",
    //                "Last Name",
    //                "Suffix",
    //                "Birth Date",
    //                "Street",
    //                "City",
    //                "County",
    //                "State",
    //                "Postal Code",
    //                "Country",
    //                "Phone Numbers",
    //                "Emails",
    //                "Race",
    //                "Sex",
    //                "Ethnicity",
    //                "Role",
    //                "Facilities",
    //                "Employed in Healthcare?",
    //                "Group or Shared Housing Resident?",
    //                "Tribal Affiliation",
    //                "Preferred Language",
    //                "Notes"

    if (patient == null) {
      return;
    }

    csvPrinter.printRecord(
        trimToEmpty(patient.getFirstName()),
        trimToEmpty(patient.getMiddleName()),
        trimToEmpty(patient.getLastName()),
        trimToEmpty(patient.getSuffix()),
        formatAsDate(patient.getBirthDate()),
        trimToEmpty(trimToEmpty(patient.getStreet()) + " " + trimToEmpty(patient.getStreetTwo())),
        trimToEmpty(patient.getCity()),
        trimToEmpty(patient.getCounty()),
        trimToEmpty(patient.getState()),
        trimToEmpty(patient.getZipCode()),
        trimToEmpty(patient.getCountry()),
        patient.getPhoneNumbers() != null
            ? patient.getPhoneNumbers().stream()
                .map(PhoneNumber::getNumber)
                .collect(Collectors.joining(";"))
            : "",
        String.join(";", ListUtils.emptyIfNull(patient.getEmails())),
        trimToEmpty(patient.getRace()),
        trimToEmpty(patient.getGender()),
        trimToEmpty(patient.getEthnicity()),
        trimToEmpty(patient.getRole().toString()),
        patient.getFacility() != null ? patient.getFacility().getFacilityName() : orgFacilityList,
        patient.getEmployedInHealthcare() != null ? patient.getEmployedInHealthcare() : "",
        patient.getResidentCongregateSetting() != null
            ? patient.getResidentCongregateSetting()
            : "",
        String.join(";", ListUtils.emptyIfNull(patient.getTribalAffiliation())),
        trimToEmpty(patient.getPreferredLanguage()),
        trimToEmpty(patient.getNotes()));
  }

  private String formatFullName(String firstName, String middleName, String lastName) {
    StringBuilder fullName = new StringBuilder();

    if (firstName != null && !firstName.isEmpty()) {
      fullName.append(firstName);
    }

    if (middleName != null && !middleName.isEmpty()) {
      if (!fullName.isEmpty()) {
        fullName.append(" ");
      }
      fullName.append(middleName);
    }

    if (lastName != null && !lastName.isEmpty()) {
      if (!fullName.isEmpty()) {
        fullName.append(" ");
      }
      fullName.append(lastName);
    }

    return fullName.toString();
  }

  private String formatFacilityName(String name, boolean isDeleted) {
    if (name == null) {
      return "";
    }

    if (isDeleted) {
      return name + " (deleted)";
    }

    return name;
  }

  private String formatHasSymptoms(boolean noSymptoms, String symptomsJson) {
    if (noSymptoms) {
      return "No";
    }

    if (symptomsJson == null || "{}".equals(symptomsJson) || symptomsJson.isEmpty()) {
      return "No";
    }

    return "Yes";
  }

  private String formatSymptomsPresent(String symptomsJson) {
    if (symptomsJson == null || "{}".equals(symptomsJson) || symptomsJson.isEmpty()) {
      return "No symptoms";
    }

    try {
      ObjectMapper mapper = new ObjectMapper();
      JsonNode symptoms = mapper.readTree(symptomsJson);

      List<String> symptomList = new ArrayList<>();
      symptoms
          .fields()
          .forEachRemaining(
              entry -> {
                if (entry.getValue().asBoolean()) {
                  symptomList.add(entry.getKey());
                }
              });

      if (symptomList.isEmpty()) {
        return "No symptoms";
      }

      return String.join(", ", symptomList);
    } catch (JsonProcessingException e) {
      log.error("Error parsing symptoms JSON: {}", symptomsJson, e);
      return "Error parsing symptoms";
    } catch (IllegalArgumentException e) {
      log.error("Invalid symptoms JSON format: {}", symptomsJson, e);
      return "Invalid symptoms format";
    }
  }

  private String formatDateValue(Object dateObj, String pattern) {
    if (dateObj == null) {
      return "";
    }

    if (dateObj instanceof java.util.Date) {
      SimpleDateFormat sdf = new SimpleDateFormat(pattern);
      return sdf.format((java.util.Date) dateObj);
    } else if (dateObj instanceof LocalDate) {
      DateTimeFormatter dtf = DateTimeFormatter.ofPattern(pattern);
      return ((LocalDate) dateObj).format(dtf);
    } else if (dateObj instanceof LocalDateTime) {
      DateTimeFormatter dtf = DateTimeFormatter.ofPattern(pattern);
      return ((LocalDateTime) dateObj).format(dtf);
    } else if (dateObj instanceof ZonedDateTime) {
      DateTimeFormatter dtf = DateTimeFormatter.ofPattern(pattern);
      return ((ZonedDateTime) dateObj).format(dtf);
    } else {
      return dateObj.toString();
    }
  }

  private String formatAsDate(Object dateObj) {
    return formatDateValue(dateObj, "MM/DD/yyyy");
  }

  private String formatAsDateTime(Object dateObj) {
    return formatDateValue(dateObj, "MM/DD/yyyy h:mma");
  }
}
