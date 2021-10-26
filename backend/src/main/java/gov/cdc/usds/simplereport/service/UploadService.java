package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumbers;
import static gov.cdc.usds.simplereport.api.Translators.parseRaceDisplayValue;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseUUID;
import static gov.cdc.usds.simplereport.api.Translators.parseUserShortDate;
import static gov.cdc.usds.simplereport.api.Translators.parseYesNo;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.RuntimeJsonMappingException;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
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
  private static final String FACILITY_ID = "facilityId";
  private static final int MAX_LINE_LENGTH = 1024 * 6;

  private final PersonService _ps;
  private final AddressValidationService _avs;
  private final OrganizationService _os;
  private boolean hasHeaderRow = false;

  private MappingIterator<Map<String, String>> getIteratorForCsv(InputStream csvStream)
      throws IllegalGraphqlArgumentException {
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
      throw new IllegalGraphqlArgumentException(e.getMessage());
    }
  }

  private Map<String, String> getNextRow(MappingIterator<Map<String, String>> valueIterator)
      throws IllegalGraphqlArgumentException {
    try {
      return valueIterator.next();
    } catch (RuntimeJsonMappingException e) {
      throw new IllegalGraphqlArgumentException(e.getMessage());
    }
  }

  public String getRow(Map<String, String> row, String name, boolean isRequired) {
    String value = row.get(name);
    if (!isRequired) {
      return value;
    }
    if (value == null || value.trim().isEmpty()) {
      throw new IllegalGraphqlArgumentException(name + " is required.");
    }
    return value;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String processPersonCSV(InputStream csvStream) throws IllegalGraphqlArgumentException {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);
    final var org = _os.getCurrentOrganization();

    // Since the CSV parser won't fail when give a single string, we simple check to see if it has
    // any parsed values
    // If not, we throw an error assuming the user didn't actually want to submit something empty.
    if (hasHeaderRow && !valueIterator.hasNext()) {
      throw new IllegalGraphqlArgumentException("Empty or invalid CSV submitted");
    }

    Instant startTime = Instant.now();

    int rowNumber = 0;
    while (valueIterator.hasNext()) {
      final Instant rowStartTime = Instant.now();
      final Map<String, String> row = getNextRow(valueIterator);
      rowNumber++;
      try {
        var facilityId = parseUUID(getRow(row, FACILITY_ID, false));
        Optional<Facility> facility =
            Optional.ofNullable(facilityId).map(_os::getFacilityInCurrentOrg);

        StreetAddress address =
            _avs.getValidatedAddress(
                getRow(row, "Street", true),
                getRow(row, "Street2", false),
                getRow(row, "City", false),
                getRow(row, "State", true),
                getRow(row, "ZipCode", true),
                null);

        var firstName = parseString(getRow(row, "FirstName", true));
        var lastName = parseString(getRow(row, "LastName", true));
        var country = parseString(getRow(row, "Country", true));
        var dob = parseUserShortDate(getRow(row, "DOB", true));

        if (_ps.isDuplicatePatient(
            firstName, lastName, dob, address.getPostalCode(), org, facility)) {
          continue;
        }

        _ps.addPatient(
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
                        null, parsePhoneNumber((getRow(row, "PhoneNumber", true)))))),
            parsePersonRole(getRow(row, "Role", false), false),
            parseEmail(getRow(row, "Email", false)),
            parseRaceDisplayValue(getRow(row, "Race", false)),
            parseEthnicity(getRow(row, "Ethnicity", false)),
            null,
            parseGender(getRow(row, "biologicalSex", false)),
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
      } catch (IllegalGraphqlArgumentException e) {
        throw new IllegalGraphqlArgumentException(
            "Error on row " + rowNumber + "; " + e.getMessage());
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
          .addColumn("employedInHealthcare", CsvSchema.ColumnType.STRING)
          .addColumn("residentCongregateSetting", CsvSchema.ColumnType.STRING)
          .addColumn("Role", CsvSchema.ColumnType.STRING)
          .addColumn("Email", CsvSchema.ColumnType.STRING)
          .addColumn(FACILITY_ID, CsvSchema.ColumnType.STRING)
          .setUseHeader(false) // no valid header row detected
          .build();
    }
  }
}
