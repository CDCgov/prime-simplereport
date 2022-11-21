package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertEthnicityToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertRaceToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertSexToDatabaseValue;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils;
import gov.cdc.usds.simplereport.validators.PatientBulkUploadFileValidator.PatientUploadRow;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientBulkUploadServiceAsync {

  private final PersonService _personService;
  private final ApiUserService _userService;
  private final AddressValidationService _addressValidationService;
  private final OrganizationService _organizationService;
  private final EmailService _emailService;

  @Value("${simple-report.patient-link-url:https://simplereport.gov/pxp?plid=}")
  private String patientLinkUrl;

  @Async
  @Transactional
  @AuthorizationConfiguration.RequirePermissionCreatePatientAtFacility
  public void savePatients(byte[] content, UUID facilityId) {
    String uploaderEmail = _userService.getCurrentApiUserInContainedTransaction().getLoginEmail();

    Organization currentOrganization = _organizationService.getCurrentOrganization();

    // Patients do not need to be assigned to a facility, but if an id is given it must be valid
    Optional<Facility> assignedFacility =
        Optional.ofNullable(facilityId).map(_organizationService::getFacilityInCurrentOrg);

    Set<Person> patientsList = new HashSet<>();
    List<PhoneNumber> phoneNumbersList = new ArrayList<>();

    final MappingIterator<Map<String, String>> valueIterator =
        CsvValidatorUtils.getIteratorForCsv(new ByteArrayInputStream(content));

    while (valueIterator.hasNext()) {
      final Map<String, String> row = CsvValidatorUtils.getNextRow(valueIterator);

      try {

        PatientUploadRow extractedData = new PatientUploadRow(row);

        // Fetch address information
        StreetAddress address =
            _addressValidationService.getValidatedAddress(
                extractedData.getStreet().getValue(),
                extractedData.getStreet2().getValue(),
                extractedData.getCity().getValue(),
                extractedData.getState().getValue(),
                extractedData.getZipCode().getValue(),
                null);

        String country =
            extractedData.getCountry().getValue() == null
                ? "USA"
                : extractedData.getCountry().getValue();

        if (_personService.isDuplicatePatient(
            extractedData.getFirstName().getValue(),
            extractedData.getLastName().getValue(),
            parseUserShortDate(extractedData.getDateOfBirth().getValue()),
            currentOrganization,
            assignedFacility)) {
          continue;
        }

        // create new person with current organization, then add to new patients list
        Person newPatient =
            new Person(
                currentOrganization,
                assignedFacility.orElse(null),
                null, // lookupid
                extractedData.getFirstName().getValue(),
                extractedData.getMiddleName().getValue(),
                extractedData.getLastName().getValue(),
                extractedData.getSuffix().getValue(),
                parseUserShortDate(extractedData.getDateOfBirth().getValue()),
                address,
                country,
                parsePersonRole(extractedData.getRole().getValue(), false),
                List.of(extractedData.getEmail().getValue()),
                convertRaceToDatabaseValue(extractedData.getRace().getValue()),
                convertEthnicityToDatabaseValue(extractedData.getEthnicity().getValue()),
                null, // tribalAffiliation
                convertSexToDatabaseValue(extractedData.getBiologicalSex().getValue()),
                parseYesNo(extractedData.getResidentCongregateSetting().getValue()),
                parseYesNo(extractedData.getEmployedInHealthcare().getValue()),
                null, // preferredLanguage
                null // testResultDeliveryPreference
                );

        if (!patientsList.contains(newPatient)) {
          // collect phone numbers and associate them with the patient
          // then add to phone numbers list and set primary phone, if exists
          List<PhoneNumber> newPhoneNumbers =
              _personService.assignPhoneNumbersToPatient(
                  newPatient,
                  List.of(
                      new PhoneNumber(
                          parsePhoneType(extractedData.getPhoneNumberType().getValue()),
                          extractedData.getPhoneNumber().getValue())));
          phoneNumbersList.addAll(newPhoneNumbers);
          newPhoneNumbers.stream().findFirst().ifPresent(newPatient::setPrimaryPhone);

          patientsList.add(newPatient);
        }
      } catch (IllegalArgumentException e) {
        String errorMessage = "Error uploading patient roster";
        log.error(
            errorMessage
                + " for organization "
                + currentOrganization.getExternalId()
                + " and facility "
                + facilityId);
        throw new IllegalArgumentException(errorMessage);
      }
    }

    _personService.addPatientsAndPhoneNumbers(patientsList, phoneNumbersList);

    String patientsUrl =
        patientLinkUrl.substring(0, patientLinkUrl.indexOf("pxp"))
            + "patients?facility="
            + facilityId;

    try {
      _emailService.sendWithDynamicTemplate(
          List.of(uploaderEmail),
          EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD,
          Map.of("patients_url", patientsUrl));
    } catch (IOException e) {
      log.info(
          "CSV patient upload email failed to send for {}",
          currentOrganization.getOrganizationName());
    }
    log.info("CSV patient upload completed for {}", currentOrganization.getOrganizationName());
  }
}
