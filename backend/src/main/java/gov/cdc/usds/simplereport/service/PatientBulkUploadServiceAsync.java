package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNoUnk;
import static gov.cdc.usds.simplereport.utils.UnknownAddressUtils.getUnknownStreetAddress;
import static gov.cdc.usds.simplereport.utils.UnknownAddressUtils.isAddressUnknown;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertEthnicityToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertGenderIdentityToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertRaceToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertSexToDatabaseValue;

import com.fasterxml.jackson.databind.MappingIterator;
import com.microsoft.applicationinsights.telemetry.SeverityLevel;
import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.AzureTelemetryConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientBulkUploadServiceAsync {

  private final ApiUserService userService;
  private final PersonService personService;
  private final AddressValidationService addressValidationService;
  private final OrganizationService organizationService;
  private final EmailService emailService;

  @Value("${simple-report.batch-size:1000}")
  private int batchSize;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  @Autowired private AzureTelemetryConfiguration appInsights;

  @Async
  @Transactional
  @AuthorizationConfiguration.RequirePermissionCreatePatientAtFacility
  public CompletableFuture<Set<Person>> savePatients(byte[] content, UUID facilityId) {
    // Create string components for notification emails
    String uploaderEmail = userService.getCurrentApiUserInContainedTransaction().getLoginEmail();
    String simplereportUrl = patientLinkUrl.substring(0, patientLinkUrl.indexOf("pxp"));
    String patientsUrl = simplereportUrl + "patients?facility=" + facilityId;

    Organization currentOrganization = organizationService.getCurrentOrganization();

    // Patients do not need to be assigned to a facility, but if an id is given it must be valid
    Optional<Facility> assignedFacility =
        Optional.ofNullable(facilityId).map(organizationService::getFacilityInCurrentOrg);

    Set<Person> patientsList = new HashSet<>();
    List<PhoneNumber> phoneNumbersList = new ArrayList<>();

    Set<Person> allPatients = new HashSet<>();
    int totalPatientCount = 0;

    final MappingIterator<Map<String, String>> valueIterator =
        CsvValidatorUtils.getIteratorForCsv(new ByteArrayInputStream(content));

    while (valueIterator.hasNext()) {
      final Map<String, String> row = CsvValidatorUtils.getNextRow(valueIterator);

      try {

        PatientUploadRow extractedData = new PatientUploadRow(row);

        String street = extractedData.getStreet().getValue();
        String state = extractedData.getState().getValue();
        String zip = extractedData.getZipCode().getValue();

        StreetAddress address = getUnknownStreetAddress();

        if (!isAddressUnknown(state, zip, street)) {
          // Fetch address information
          address =
              addressValidationService.getValidatedAddress(
                  street,
                  extractedData.getStreet2().getValue(),
                  extractedData.getCity().getValue(),
                  state,
                  zip);
        }

        String country =
            extractedData.getCountry().getValue() == null
                ? "USA"
                : extractedData.getCountry().getValue();

        if (personService.isDuplicatePatient(
            extractedData.getFirstName().getValue(),
            extractedData.getLastName().getValue(),
            parseUserShortDate(extractedData.getDateOfBirth().getValue()),
            currentOrganization,
            assignedFacility)) {
          continue;
        }

        // create new person with current organization, then add to new patients list
        Person newPatient =
            Person.builder()
                .organization(currentOrganization)
                .facility(assignedFacility.orElse(null))
                .birthDate(parseUserShortDate(extractedData.getDateOfBirth().getValue()))
                .address(address)
                .country(country)
                .role(parsePersonRole(extractedData.getRole().getValue(), false))
                .emails(
                    StringUtils.isBlank(extractedData.getEmail().getValue())
                        ? Collections.emptyList()
                        : List.of(extractedData.getEmail().getValue()))
                .race(convertRaceToDatabaseValue(extractedData.getRace().getValue()))
                .ethnicity(convertEthnicityToDatabaseValue(extractedData.getEthnicity().getValue()))
                .gender(convertSexToDatabaseValue(extractedData.getBiologicalSex().getValue()))
                .genderIdentity(
                    StringUtils.isBlank(extractedData.getGenderIdentity().getValue())
                        ? null
                        : convertGenderIdentityToDatabaseValue(
                            extractedData.getGenderIdentity().getValue()))
                .residentCongregateSetting(
                    parseYesNoUnk(extractedData.getResidentCongregateSetting().getValue()))
                .employedInHealthcare(
                    parseYesNoUnk(extractedData.getEmployedInHealthcare().getValue()))
                .firstName(extractedData.getFirstName().getValue())
                .middleName(extractedData.getMiddleName().getValue())
                .lastName(extractedData.getLastName().getValue())
                .suffix(extractedData.getSuffix().getValue())
                .notes(extractedData.getNotes().getValue())
                .build();

        if (!allPatients.contains(newPatient)) {
          // collect phone numbers and associate them with the patient
          // then add to phone numbers list and set primary phone, if exists
          List<PhoneNumber> newPhoneNumbers =
              personService.assignPhoneNumbersToPatient(
                  newPatient,
                  List.of(
                      new PhoneNumber(
                          parsePhoneType(extractedData.getPhoneNumberType().getValue()),
                          extractedData.getPhoneNumber().getValue())));
          phoneNumbersList.addAll(newPhoneNumbers);
          newPhoneNumbers.stream().findFirst().ifPresent(newPatient::setPrimaryPhone);

          patientsList.add(newPatient);
          allPatients.add(newPatient);
          totalPatientCount += 1;
        }

        if (patientsList.size() >= batchSize) {
          personService.addPatientsAndPhoneNumbers(patientsList, phoneNumbersList);
          // clear lists after save, so we don't try to save duplicate records
          patientsList.clear();
          phoneNumbersList.clear();
        }
      } catch (IllegalArgumentException | NullPointerException e) {
        sendEmail(
            uploaderEmail,
            currentOrganization,
            EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD_ERROR,
            Map.of("simplereport_url", simplereportUrl));

        String errorMessage = "Error uploading patient roster";
        logProcessingFailure(errorMessage, currentOrganization.getExternalId(), facilityId);
        throw new IllegalArgumentException(errorMessage);
      }
    }

    try {
      personService.addPatientsAndPhoneNumbers(patientsList, phoneNumbersList);
    } catch (IllegalArgumentException | OptimisticLockingFailureException e) {
      sendEmail(
          uploaderEmail,
          currentOrganization,
          EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD_ERROR,
          Map.of("simplereport_url", simplereportUrl));

      String errorMessage = "Error saving patient roster";
      logProcessingFailure(errorMessage, currentOrganization.getExternalId(), facilityId);

      throw new IllegalArgumentException(errorMessage);
    }

    log.info(
        "CSV patient upload completed for {}. {} total patients uploaded",
        currentOrganization.getOrganizationName(),
        totalPatientCount);

    sendEmail(
        uploaderEmail,
        currentOrganization,
        EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD,
        Map.of("patients_url", patientsUrl));

    return CompletableFuture.completedFuture(patientsList);
  }

  private void sendEmail(
      String uploaderEmail,
      Organization currentOrganization,
      EmailProviderTemplate template,
      Map<String, Object> templateVariables) {
    try {
      emailService.sendWithDynamicTemplate(List.of(uploaderEmail), template, templateVariables);
    } catch (IOException exception) {
      log.info(
          "CSV patient upload email failed to send for {}",
          currentOrganization.getOrganizationName());
    }
  }

  private void logProcessingFailure(String errorMessage, String externalId, UUID facilityId) {
    Map<String, String> customProperties =
        Map.of("orgId", externalId, "facilityId", facilityId.toString());
    this.appInsights
        .getTelemetryClient()
        .trackTrace(errorMessage, SeverityLevel.Error, customProperties);
  }
}
