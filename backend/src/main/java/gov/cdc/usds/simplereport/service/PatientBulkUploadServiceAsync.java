package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertEthnicityToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertRaceToDatabaseValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.convertSexToDatabaseValue;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils;
import gov.cdc.usds.simplereport.validators.PatientBulkUploadFileValidator;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientBulkUploadServiceAsync {

  private final PersonService _personService;
  private final AddressValidationService _addressValidationService;
  private final OrganizationService _organizationService;

  @Async
  public void savePatients(
      byte[] content,
      UUID facilityId,
      Organization currentOrganization,
      Facility assignedFacility) {

    System.out.println("BOOYAH");
    System.out.println("security context: " + SecurityContextHolder.getContext());
    System.out.println("thread name: " + Thread.currentThread().getName());

    List<Person> patientsList = new ArrayList<>();
    List<PhoneNumber> phoneNumbersList = new ArrayList<>();

    final MappingIterator<Map<String, String>> valueIterator =
        CsvValidatorUtils.getIteratorForCsv(new ByteArrayInputStream(content));

    Optional<Facility> facility =
        Optional.ofNullable(facilityId).map(_organizationService::getFacilityInCurrentOrg);

    while (valueIterator.hasNext()) {
      final Map<String, String> row = CsvValidatorUtils.getNextRow(valueIterator);

      try {

        PatientBulkUploadFileValidator.PatientUploadRow extractedData =
            new PatientBulkUploadFileValidator.PatientUploadRow(row);

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
            facility)) {
          continue;
        }

        // create new person with current organization, then add to new patients list
        Person newPatient =
            new Person(
                currentOrganization,
                null,
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
                null,
                convertSexToDatabaseValue(extractedData.getBiologicalSex().getValue()),
                parseYesNo(extractedData.getResidentCongregateSetting().getValue()),
                parseYesNo(extractedData.getEmployedInHealthcare().getValue()),
                null,
                null);
        newPatient.setFacility(assignedFacility); // might be null, that's fine

        // collect phone numbers and associate them with the patient, then add to phone numbers list
        List<PhoneNumber> newPhoneNumbers =
            _personService.assignPhoneNumbersToPatient(
                newPatient,
                List.of(
                    new PhoneNumber(
                        parsePhoneType(extractedData.getPhoneNumberType().getValue()),
                        extractedData.getPhoneNumber().getValue())));
        phoneNumbersList.addAll(newPhoneNumbers);

        // set primary phone number
        if (!newPhoneNumbers.isEmpty()) {
          newPatient.setPrimaryPhone(newPhoneNumbers.get(0));
        }

        // add new patient to the patients list
        patientsList.add(newPatient);
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

    if (patientsList != null && phoneNumbersList != null) {
      _personService.addPatientsAndPhoneNumbers(patientsList, phoneNumbersList);
    }
  }
}
