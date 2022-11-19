package gov.cdc.usds.simplereport.validators;

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

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PatientUploadRow extends FileRow {
  private ValueOrError firstName;
  private ValueOrError lastName;
  private ValueOrError middleName;
  private ValueOrError suffix;
  private ValueOrError race;
  private ValueOrError dateOfBirth;
  private ValueOrError biologicalSex;
  private ValueOrError ethnicity;
  private ValueOrError street;
  private ValueOrError street2;
  private ValueOrError city;
  private ValueOrError county;
  private ValueOrError state;
  private ValueOrError zipCode;
  private ValueOrError country;
  private ValueOrError phoneNumber;
  private ValueOrError phoneNumberType;
  private ValueOrError employedInHealthcare;
  private ValueOrError residentCongregateSetting;
  private ValueOrError role;
  private ValueOrError email;

  public PatientUploadRow(Map<String, String> rawRow) {
    processRow(rawRow);
  }

  @Override
  void processRow(Map<String, String> rawRow) {
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

  @Override
  public List<FeedbackMessage> validateHeaders() {
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

  @Override
  List<FeedbackMessage> validateIndividualValues() {
    var errors = new ArrayList<FeedbackMessage>();
    // demographics
    errors.addAll(validateFlexibleDate(dateOfBirth));
    errors.addAll(validateRace(race));
    errors.addAll(validateBiologicalSex(biologicalSex));
    errors.addAll(validateEthnicity(ethnicity));

    // housing, work, and role
    errors.addAll(validateYesNoAnswer(residentCongregateSetting));
    errors.addAll(validateYesNoAnswer(employedInHealthcare));
    errors.addAll(validateRole(role));

    // address
    errors.addAll(validateState(state));
    errors.addAll(validateZipCode(zipCode));
    errors.addAll(validateCountry(country));

    // contact info
    errors.addAll(validatePhoneNumber(phoneNumber));
    errors.addAll(validatePhoneNumberType(phoneNumberType));
    errors.addAll(validateEmail(email));

    return errors;
  }
}
