package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertEthnicityToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertRaceToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertSexToDatabaseValue;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to upload a roster of patient data given a CSV input. Formerly restricted to superusers
 * but now (almost) available to end users.
 *
 * <p>Updated by emmastephenson on 10/24/2022
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PatientBulkUploadService {

  private final PersonService _personService;
  private final AddressValidationService _addressValidationService;
  private final OrganizationService _organizationService;
  private final FileValidator<PatientUploadRow> _patientBulkUploadFileValidator;

  // This authorization will change once we open the feature to end users
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public PatientBulkUploadResponse processPersonCSV(InputStream csvStream, UUID facilityId)
      throws IllegalArgumentException {

    PatientBulkUploadResponse result = new PatientBulkUploadResponse();

    Organization currentOrganization = _organizationService.getCurrentOrganization();

    // Patients do not need to be assigned to a facility, but if an id is given it must be valid
    Optional<Facility> assignedFacility =
        Optional.ofNullable(facilityId).map(_organizationService::getFacilityInCurrentOrg);

    Set<Person> patientsList = new HashSet<>();
    List<PhoneNumber> phoneNumbersList = new ArrayList<>();

    byte[] content;

    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      log.error("Error reading patient bulk upload CSV", e);
      throw new CsvProcessingException("Unable to read csv");
    }

    List<FeedbackMessage> errors =
        _patientBulkUploadFileValidator.validate(new ByteArrayInputStream(content));

    if (!errors.isEmpty()) {
      result.setStatus(UploadStatus.FAILURE);
      result.setErrors(errors.toArray(FeedbackMessage[]::new));
      return result;
    }

    // This is the point where we need to figure out multithreading
    // because what needs to happen is that we return a success message to the end user
    // but continue to process the csv (create person records) in the background.
    // Putting a pin in it for now.

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

    log.info("CSV patient upload completed for {}", currentOrganization.getOrganizationName());
    result.setStatus(UploadStatus.SUCCESS);
    // eventually want to send an email here instead of return success
    return result;
  }
}
