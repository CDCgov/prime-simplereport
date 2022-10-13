package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parseEmails;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumbers;
import static gov.cdc.usds.simplereport.api.Translators.parseRaceDisplayValue;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.RuntimeJsonMappingException;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Created by nickrobison on 11/21/20 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UploadService {
  private static final int MAX_LINE_LENGTH = 1024 * 6;
  public static final String ZIP_CODE_REGEX = "^[0-9]{5}(?:-[0-9]{4})?$";

  private final PersonService personService;
  private final AddressValidationService addressValidationService;
  private final OrganizationService organizationService;
  private boolean hasHeaderRow = false;

  private MappingIterator<Map<String, String>> getIteratorForCsv(InputStream csvStream)
      throws IllegalArgumentException {
    try {
      BufferedReader csvStreamBuffered =
          new BufferedReader(new InputStreamReader(csvStream, StandardCharsets.UTF_8));

      // determine if this csv has a header row in the first line by looking for header string
      csvStreamBuffered.mark(MAX_LINE_LENGTH);
      hasHeaderRow = (csvStreamBuffered.readLine().toLowerCase().contains("firstname"));
      csvStreamBuffered.reset();

      return new CsvMapper()
          .enable(CsvParser.Feature.FAIL_ON_MISSING_COLUMNS)
          .readerFor(Map.class)
          .with(personSchema(hasHeaderRow))
          .readValues(csvStreamBuffered);
    } catch (IOException e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  private Map<String, String> getNextRow(MappingIterator<Map<String, String>> valueIterator)
      throws IllegalArgumentException {
    try {
      return valueIterator.next();
    } catch (RuntimeJsonMappingException e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  public String getRow(Map<String, String> row, String name, boolean isRequired) {
    String value = row.get(name);
    if (isRequired && (value == null || value.trim().isEmpty())) {
      throw new IllegalArgumentException(name + " is required.");
    }
    return value;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String processPersonCSV(InputStream csvStream, UUID facilityId)
      throws IllegalArgumentException {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);
    final var org = organizationService.getCurrentOrganization();

    // Since the CSV parser won't fail when give a single string, we simple check to see if it has
    // any parsed values
    // If not, we throw an error assuming the user didn't actually want to submit something empty.
    if (hasHeaderRow && !valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    Instant startTime = Instant.now();

    int rowNumber = 0;
    while (valueIterator.hasNext()) {
      final Instant rowStartTime = Instant.now();
      final Map<String, String> row = getNextRow(valueIterator);
      rowNumber++;
      try {
        Optional<Facility> facility =
            Optional.ofNullable(facilityId).map(organizationService::getFacilityInCurrentOrg);

        String zipCode = getRow(row, "ZipCode", true);
        if (!zipCode.matches(ZIP_CODE_REGEX)) {
          throw new IllegalArgumentException("Invalid zip code");
        }

        StreetAddress address =
            addressValidationService.getValidatedAddress(
                getRow(row, "Street", true),
                getRow(row, "Street2", false),
                getRow(row, "City", false),
                getRow(row, "State", true),
                zipCode,
                null);

        var firstName = parseString(getRow(row, "FirstName", true));
        var lastName = parseString(getRow(row, "LastName", true));
        var dob = parseUserShortDate(getRow(row, "DOB", true));
        var country = parseString(getRow(row, "Country", false));

        if (country == null) {
          country = "USA";
        }

        if (personService.isDuplicatePatient(firstName, lastName, dob, org, facility)) {
          continue;
        }

        personService.addPatient(
            facilityId,
            null, // lookupID
            firstName,
            parseString(getRow(row, "MiddleName", false)),
            lastName,
            parseString(getRow(row, "Suffix", false)),
            dob,
            address,
            country,
            parsePhoneNumbers(
                List.of(
                    new PhoneNumberInput(
                        getRow(row, "PhoneNumberType", false), getRow(row, "PhoneNumber", true)))),
            parsePersonRole(getRow(row, "Role", false), false),
            parseEmails(List.of(getRow(row, "Email", false))),
            parseRaceDisplayValue(getRow(row, "Race", true)),
            parseEthnicity(getRow(row, "Ethnicity", true)),
            null,
            parseGender(getRow(row, "biologicalSex", true)),
            parseYesNo(getRow(row, "residentCongregateSetting", true)),
            parseYesNo(getRow(row, "employedInHealthcare", true)),
            null, // Not including preferredLanguage for now
            null); // Not including test result delivery preference for now

        Duration rowElapsed = Duration.between(rowStartTime, Instant.now());
        Duration totalElapsed = Duration.between(startTime, Instant.now());
        log.debug(
            "Processed row {} in {}ms; {} minutes total",
            rowNumber,
            rowElapsed.toMillis(),
            totalElapsed.toMinutes());
      } catch (IllegalArgumentException e) {
        String errorMessage = "Error on row " + rowNumber + "; " + e.getMessage();
        log.error(errorMessage);
        throw new IllegalArgumentException(errorMessage);
      }
    }

    log.info(
        "CSV Patient upload completed for {} records in {} minutes",
        rowNumber,
        Duration.between(startTime, Instant.now()).toMinutes());
    return "Successfully uploaded " + rowNumber + " record(s)";
  }

  private static CsvSchema personSchema(boolean hasHeaderRow) {
    // using both addColumn and setUseHeader() causes offset issues (columns don't align). use one
    // or the other.
    if (hasHeaderRow) {
      return CsvSchema.builder().setUseHeader(true).build();
    } else {
      // Sequence order matters
      return CsvSchema.builder()
          .addColumn("FirstName", CsvSchema.ColumnType.STRING)
          .addColumn("LastName", CsvSchema.ColumnType.STRING)
          .addColumn("MiddleName", CsvSchema.ColumnType.STRING)
          .addColumn("Suffix", CsvSchema.ColumnType.STRING)
          .addColumn("Race", CsvSchema.ColumnType.STRING)
          .addColumn("DOB", CsvSchema.ColumnType.STRING)
          .addColumn("biologicalSex", CsvSchema.ColumnType.STRING)
          .addColumn("Ethnicity", CsvSchema.ColumnType.STRING)
          .addColumn("Street", CsvSchema.ColumnType.STRING)
          .addColumn("Street2", CsvSchema.ColumnType.STRING)
          .addColumn("City", CsvSchema.ColumnType.STRING)
          .addColumn("County", CsvSchema.ColumnType.STRING)
          .addColumn("State", CsvSchema.ColumnType.STRING)
          .addColumn("ZipCode", CsvSchema.ColumnType.STRING)
          .addColumn("Country", CsvSchema.ColumnType.STRING)
          .addColumn("PhoneNumber", CsvSchema.ColumnType.STRING)
          .addColumn("PhoneNumberType", CsvSchema.ColumnType.STRING)
          .addColumn("employedInHealthcare", CsvSchema.ColumnType.STRING)
          .addColumn("residentCongregateSetting", CsvSchema.ColumnType.STRING)
          .addColumn("Role", CsvSchema.ColumnType.STRING)
          .addColumn("Email", CsvSchema.ColumnType.STRING)
          .setUseHeader(false) // no valid header row detected
          .build();
    }
  }
}
