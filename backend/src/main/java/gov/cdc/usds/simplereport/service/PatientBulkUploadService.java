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
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils;
import gov.cdc.usds.simplereport.validators.PatientBulkUploadFileValidator;
import gov.cdc.usds.simplereport.validators.PatientBulkUploadFileValidator.PatientUploadRow;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
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
        CsvValidatorUtils.getIteratorForCsv(new ByteArrayInputStream(content));

    Optional<Facility> facility =
        Optional.ofNullable(facilityId).map(_organizationService::getFacilityInCurrentOrg);

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

        String country = "USA";

        if (_personService.isDuplicatePatient(
            extractedData.getFirstName().getValue(),
            extractedData.getLastName().getValue(),
            parseUserShortDate(extractedData.getDateOfBirth().getValue()),
            org,
            facility)) {
          continue;
        }

        _personService.addPatient(
            facilityId,
            null, // lookupID
            extractedData.getFirstName().getValue(),
            extractedData.getMiddleName().getValue(),
            extractedData.getLastName().getValue(),
            extractedData.getSuffix().getValue(),
            parseUserShortDate(extractedData.getDateOfBirth().getValue()),
            address,
            country,
            List.of(
                new PhoneNumber(
                    parsePhoneType(extractedData.getPhoneNumberType().getValue()),
                    extractedData.getPhoneNumber().getValue())),
            parsePersonRole(extractedData.getRole().getValue(), false),
            List.of(extractedData.getEmail().getValue()),
            convertRaceToDatabaseValue(extractedData.getRace().getValue()),
            convertEthnicityToDatabaseValue(extractedData.getEthnicity().getValue()),
            null,
            convertSexToDatabaseValue(extractedData.getBiologicalSex().getValue()),
            parseYesNo(extractedData.getResidentCongregateSetting().getValue()),
            parseYesNo(extractedData.getEmployedInHealthcare().getValue()),
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
