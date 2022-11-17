package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateBiologicalSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateCountry;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEmail;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateFlexibleDate;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumberType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRace;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRole;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateState;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateYesNoAnswer;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
public class PatientBulkUploadFileValidator {

  public List<FeedbackMessage> validate(InputStream csvStream) {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    var mapOfErrors = new HashMap<String, FeedbackMessage>();
    var currentRow = 1;

    while (valueIterator.hasNext()) {
      Map<String, String> row;
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        var feedback =
            new FeedbackMessage(
                CsvValidatorUtils.REPORT_SCOPE,
                "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.",
                List.of(ex.getLineNumber()));
        mapOfErrors.put(feedback.getMessage(), feedback);
        break;
      }
      var currentRowErrors = new ArrayList<FeedbackMessage>();

      PatientUploadRow extractedData = new PatientUploadRow(row);

      currentRowErrors.addAll(extractedData.validateHeaders());

      // validate individual values

      // demographics
      currentRowErrors.addAll(validateFlexibleDate(extractedData.dateOfBirth));
      currentRowErrors.addAll(validateRace(extractedData.race));
      currentRowErrors.addAll(validateBiologicalSex(extractedData.biologicalSex));
      currentRowErrors.addAll(validateEthnicity(extractedData.ethnicity));

      // housing, work, and role
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.residentCongregateSetting));
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.employedInHealthcare));
      currentRowErrors.addAll(validateRole(extractedData.role));

      // address
      currentRowErrors.addAll(validateState(extractedData.state));
      currentRowErrors.addAll(validateZipCode(extractedData.zipCode));
      currentRowErrors.addAll(validateCountry(extractedData.country));

      // contact info
      currentRowErrors.addAll(validatePhoneNumber(extractedData.phoneNumber));
      currentRowErrors.addAll(validatePhoneNumberType(extractedData.phoneNumberType));
      currentRowErrors.addAll(validateEmail(extractedData.email));

      final var finalCurrentRow = currentRow;
      currentRowErrors.forEach(
          error -> error.setIndices(new ArrayList<>(List.of(finalCurrentRow))));

      currentRowErrors.forEach(
          error ->
              mapOfErrors.merge(
                  error.getMessage(),
                  error,
                  (e1, e2) -> {
                    e1.getIndices().addAll(e2.getIndices());
                    return e1;
                  }));

      currentRow++;
    }
    var errors = new ArrayList<>(mapOfErrors.values());
    errors.sort(Comparator.comparingInt(e -> e.getIndices().get(0)));
    return errors;
  }

  @Getter
  public static class PatientUploadRow {
    private final ValueOrError firstName;
    private final ValueOrError lastName;
    private final ValueOrError middleName;
    private final ValueOrError suffix;
    private final ValueOrError race;
    private final ValueOrError dateOfBirth;
    private final ValueOrError biologicalSex;
    private final ValueOrError ethnicity;
    private final ValueOrError street;
    private final ValueOrError street2;
    private final ValueOrError city;
    private final ValueOrError county;
    private final ValueOrError state;
    private final ValueOrError zipCode;
    private final ValueOrError country;
    private final ValueOrError phoneNumber;
    private final ValueOrError phoneNumberType;
    private final ValueOrError employedInHealthcare;
    private final ValueOrError residentCongregateSetting;
    private final ValueOrError role;
    private final ValueOrError email;

    public PatientUploadRow(Map<String, String> rawRow) {
      firstName = getValue(rawRow, "first_name", true);
      lastName = getValue(rawRow, "last_name", true);
      middleName = getValue(rawRow, "middle_name", false);
      suffix = getValue(rawRow, "suffix", false);
      race = getValue(rawRow, "race", true);
      dateOfBirth = getValue(rawRow, "date_of_birth", true);
      biologicalSex = getValue(rawRow, "biological_sex", true);
      ethnicity = getValue(rawRow, "ethnicity", true);
      street = getValue(rawRow, "street", true);
      street2 = getValue(rawRow, "street_2", false);
      city = getValue(rawRow, "city", false);
      county = getValue(rawRow, "county", false);
      state = getValue(rawRow, "state", true);
      zipCode = getValue(rawRow, "zip_code", true);
      country = getValue(rawRow, "country", false);
      phoneNumber = getValue(rawRow, "phone_number", true);
      phoneNumberType = getValue(rawRow, "phone_number_type", false);
      employedInHealthcare = getValue(rawRow, "employed_in_healthcare", true);
      residentCongregateSetting = getValue(rawRow, "resident_congregate_setting", true);
      role = getValue(rawRow, "role", false);
      email = getValue(rawRow, "email", false);
    }

    private List<FeedbackMessage> validateHeaders() {
      List<ValueOrError> allFields =
          List.of(
              firstName,
              lastName,
              middleName,
              suffix,
              race,
              dateOfBirth,
              biologicalSex,
              ethnicity,
              street,
              street2,
              city,
              county,
              state,
              zipCode,
              country,
              phoneNumber,
              phoneNumberType,
              employedInHealthcare,
              residentCongregateSetting,
              role,
              email);

      List<FeedbackMessage> rowErrors = new ArrayList<>();
      allFields.forEach(field -> rowErrors.addAll(field.getPossibleError()));
      return rowErrors;
    }
  }
}
