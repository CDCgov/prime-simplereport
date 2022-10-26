package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils;
import gov.cdc.usds.simplereport.validators.PatientBulkUploadFileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to upload a roster of patient data given a CSV input. Formerly restricted to superusers
 * but now available to end users.
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
  private final PatientBulkUploadFileValidator _patientBulkUploadFileValidator;

  public String getRow(Map<String, String> row, String name, boolean isRequired) {
    String value = row.get(name);
    if (isRequired && (value == null || value.trim().isEmpty())) {
      throw new IllegalArgumentException(name + " is required.");
    }
    return value;
  }

  // This authorization will change once we open the feature to end users
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public PatientBulkUploadResponse processPersonCSV(InputStream csvStream, UUID facilityId)
      throws IllegalArgumentException {

    PatientBulkUploadResponse result = new PatientBulkUploadResponse();
    result.setStatus(UploadStatus.FAILURE);

    Organization org = _organizationService.getCurrentOrganization();

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
      result.setErrors(errors.toArray(FeedbackMessage[]::new));
      return result;
    }

    // This is the point where we need to figure out multithreading
    // because what needs to happen is that we return a success message to the end user
    // but continue to process the csv (create person records) in the background.
    // Putting a pin in it for now.

    final MappingIterator<Map<String, String>> valueIterator =
        CsvValidatorUtils.getIteratorForCsv(csvStream);

    Optional<Facility> facility =
        Optional.ofNullable(facilityId).map(_organizationService::getFacilityInCurrentOrg);

    while (valueIterator.hasNext()) {
      final Map<String, String> row = CsvValidatorUtils.getNextRow(valueIterator);

      try {
        // get address here
        StreetAddress address =
            _addressValidationService.getValidatedAddress(
                getValue(row, "Street", true).getValue(),
                getValue(row, "Street2", false).getValue(),
                getValue(row, "City", false).getValue(),
                getValue(row, "State", true).getValue(),
                getValue(row, "ZipCode", true).getValue(),
                null);

        String firstName = getValue(row, "FirstName", true).getValue();
        String lastName = getValue(row, "LastName", true).getValue();
        String middleName = getValue(row, "MiddleName", false).getValue();
        String suffix = getValue(row, "Suffix", false).getValue();
        String race = getValue(row, "Race", true).getValue();
        LocalDate dob = parseUserShortDate(getValue(row, "DOB", true).getValue());
        String biologicalSex = getValue(row, "biologicalSex", true).getValue();
        String ethnicity = getValue(row, "Ethnicity", true).getValue();
        String phoneNumber = getValue(row, "PhoneNumber", true).getValue();
        String phoneNumberType = getValue(row, "PhoneNumberType", false).getValue();
        Boolean employedInHealthcare =
            parseYesNo(getValue(row, "employedInHealthcare", true).getValue());
        Boolean residentCongregateSetting =
            parseYesNo(getValue(row, "residentCongregateSetting", true).getValue());
        PersonRole role = parsePersonRole(getValue(row, "role", false).getValue(), false);
        String email = getValue(row, "email", false).getValue();

        String country = parseString(getValue(row, "Country", false).getValue());

        if (country == null) {
          country = "USA";
        }

        if (_personService.isDuplicatePatient(firstName, lastName, dob, org, facility)) {
          continue;
        }

        _personService.addPatient(
            facilityId,
            null, // lookupID
            firstName,
            middleName,
            lastName,
            suffix,
            dob,
            address,
            country,
            List.of(new PhoneNumber(parsePhoneType(phoneNumberType), phoneNumber)),
            role,
            List.of(email),
            race,
            ethnicity,
            null,
            biologicalSex,
            residentCongregateSetting,
            employedInHealthcare,
            null,
            null);
      } catch (IllegalArgumentException e) {
        String errorMessage = "Error uploading patient roster";
        log.error(
            errorMessage
                + " for organization "
                + org.getExternalId()
                + " and facility "
                + facilityId);
        throw new IllegalArgumentException(errorMessage);
      }
    }

    log.info("CSV patient upload completed for {}", org.getOrganizationName());
    result.setStatus(UploadStatus.SUCCESS);
    // eventually want to send an email here instead of return success
    return result;
  }
}
