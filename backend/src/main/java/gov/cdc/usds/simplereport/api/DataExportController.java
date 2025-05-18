package gov.cdc.usds.simplereport.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.db.model.*;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultsListItem;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.StringWriter;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class DataExportController {
  private final ResultService resultService;
  private final DiseaseService diseaseService;

  @GetMapping(value = "/api/results/download", produces = "text/csv")
  public ResponseEntity<Resource> downloadResultsAsCSV(
      @RequestParam(required = false) UUID facilityId,
      @RequestParam(required = false) UUID patientId,
      @RequestParam(required = false) String result,
      @RequestParam(required = false) String role,
      @RequestParam(required = false) String disease,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate,
      @RequestParam(defaultValue = "0") int pageNumber,
      @RequestParam(defaultValue = "20000") int pageSize) {

    log.info("CSV download request received with facilityId={}, pageSize={}", facilityId, pageSize);

    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }

    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }

    SupportedDisease supportedDisease =
        disease != null ? diseaseService.getDiseaseByName(disease) : null;

    Page<TestResultsListItem> resultsPage;
    if (facilityId == null) {
      resultsPage =
          resultService
              .getOrganizationResults(
                  patientId,
                  Translators.parseTestResult(result),
                  Translators.parsePersonRole(role, true),
                  supportedDisease,
                  startDate,
                  endDate,
                  pageNumber,
                  pageSize)
              .map(TestResultsListItem::new);
    } else {
      resultsPage =
          resultService
              .getFacilityResults(
                  facilityId,
                  patientId,
                  Translators.parseTestResult(result),
                  Translators.parsePersonRole(role, true),
                  supportedDisease,
                  startDate,
                  endDate,
                  pageNumber,
                  pageSize)
              .map(TestResultsListItem::new);
    }

    String csvContent = convertResultsToCSV(resultsPage.getContent());
    ByteArrayInputStream byteArrayInputStream =
        new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8));
    InputStreamResource fileInputStream = new InputStreamResource(byteArrayInputStream);

    String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
    String csvFileName = "simplereport-test-results-" + timestamp + ".csv";
    HttpHeaders headers = new HttpHeaders();
    headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + csvFileName);
    headers.set(HttpHeaders.CONTENT_TYPE, "text/csv;charset=UTF-8");

    return new ResponseEntity<>(fileInputStream, headers, HttpStatus.OK);
  }

  private String convertResultsToCSV(List<TestResultsListItem> results) {
    StringWriter stringWriter = new StringWriter();
    CSVPrinter csvPrinter = null;

    try {
      csvPrinter =
          new CSVPrinter(
              stringWriter,
              CSVFormat.DEFAULT.withHeader(
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
                  "Patient is employed in healthcare"));

      List<TestResultsListItem> sortedResults = new ArrayList<>(results);
      sortedResults.sort((a, b) -> b.getDateTested().compareTo(a.getDateTested()));

      for (TestResultsListItem item : sortedResults) {
        Person patient = item.getPatient();
        DeviceType deviceType = item.getDeviceType();
        Facility facility = item.getFacility();
        AskOnEntrySurvey surveyData = item.getSurveyData();
        ApiUser createdBy = item.getCreatedBy();

        String firstName = patient.getFirstName();
        String middleName = patient.getMiddleName();
        String lastName = patient.getLastName();
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
            facility != null
                ? formatFacilityName(facility.getFacilityName(), facility.getIsDeleted())
                : "";

        String hasSymptoms =
            formatHasSymptoms(
                surveyData != null && surveyData.getNoSymptoms() != null
                    ? surveyData.getNoSymptoms()
                    : false,
                surveyData != null ? surveyData.getSymptomsJSON() : null);

        String symptomsPresent =
            formatSymptomsPresent(surveyData != null ? surveyData.getSymptomsJSON() : null);

        String swabType = "";
        if (deviceType != null
            && deviceType.getSwabTypes() != null
            && !deviceType.getSwabTypes().isEmpty()) {
          swabType = deviceType.getSwabTypes().get(0).getName();
        }

        String phoneNumber = "";
        if (patient.getPhoneNumbers() != null && !patient.getPhoneNumbers().isEmpty()) {
          phoneNumber = patient.getPhoneNumbers().get(0).getNumber();
        }

        String tribalAffiliation = "";
        if (patient.getTribalAffiliation() != null && !patient.getTribalAffiliation().isEmpty()) {
          tribalAffiliation = String.join(", ", patient.getTribalAffiliation());
        }

        csvPrinter.printRecord(
            firstName,
            middleName,
            lastName,
            fullName,
            formatAsDate(patient.getBirthDate()),
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
            patient.getRole() != null ? patient.getRole().toString() : "",
            patient.getLookupId(),
            patient.getPreferredLanguage(),
            phoneNumber,
            patient.getEmail(),
            patient.getStreet(),
            patient.getStreetTwo(),
            patient.getCity(),
            patient.getState(),
            patient.getZipCode(),
            patient.getCounty(),
            patient.getCountry(),
            patient.getGender() != null ? patient.getGender().toString() : "",
            patient.getRace() != null ? patient.getRace().toString() : "",
            patient.getEthnicity() != null ? patient.getEthnicity().toString() : "",
            tribalAffiliation,
            patient.getResidentCongregateSetting(),
            patient.getEmployedInHealthcare());
      }

      csvPrinter.flush();
      return stringWriter.toString();
    } catch (IOException e) {
      log.error("Error creating CSV file", e);
      return "Error generating CSV";
    } finally {
      if (csvPrinter != null) {
        try {
          csvPrinter.close();
        } catch (IOException e) {
          log.error("Error closing CSV printer", e);
        }
      }
    }
  }

  private String formatFullName(String firstName, String middleName, String lastName) {
    StringBuilder fullName = new StringBuilder();

    if (firstName != null && !firstName.isEmpty()) {
      fullName.append(firstName);
    }

    if (middleName != null && !middleName.isEmpty()) {
      if (fullName.length() > 0) {
        fullName.append(" ");
      }
      fullName.append(middleName);
    }

    if (lastName != null && !lastName.isEmpty()) {
      if (fullName.length() > 0) {
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

    if (symptomsJson == null || symptomsJson.equals("{}") || symptomsJson.isEmpty()) {
      return "No";
    }

    return "Yes";
  }

  private String formatSymptomsPresent(String symptomsJson) {
    if (symptomsJson == null || symptomsJson.equals("{}") || symptomsJson.isEmpty()) {
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
    } catch (Exception e) {
      log.error("Error parsing symptoms JSON", e);
      return "Error parsing symptoms";
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
    return formatDateValue(dateObj, "MM/dd/yyyy");
  }

  private String formatAsDateTime(Object dateObj) {
    return formatDateValue(dateObj, "MM/dd/yyyy h:mma");
  }
}
