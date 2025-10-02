package gov.cdc.usds.simplereport.api.model.filerow;

import static gov.cdc.usds.simplereport.utils.UnknownAddressUtils.isAddressUnknown;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateCountry;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEmail;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateFlexibleDate;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateGenderIdentity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePartialUnkAddress;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumberType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRace;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRole;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateState;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateYesNoUnknownAnswer;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Getter;

@Getter
public class PatientUploadRow implements FileRow {
  final ValueOrError firstName;
  final ValueOrError lastName;
  final ValueOrError middleName;
  final ValueOrError suffix;
  final ValueOrError race;
  final ValueOrError dateOfBirth;
  final ValueOrError sex;
  final ValueOrError ethnicity;
  final ValueOrError street;
  final ValueOrError street2;
  final ValueOrError city;
  final ValueOrError county;
  final ValueOrError state;
  final ValueOrError zipCode;
  final ValueOrError country;
  final ValueOrError phoneNumber;
  final ValueOrError phoneNumberType;
  final ValueOrError employedInHealthcare;
  final ValueOrError residentCongregateSetting;
  final ValueOrError role;
  final ValueOrError email;
  final ValueOrError genderIdentity;
  final ValueOrError notes;

  static final String FIRST_NAME = "first_name";
  static final String LAST_NAME = "last_name";
  static final String RACE_FIELD = "race";
  static final String DATE_OF_BIRTH = "date_of_birth";
  static final String SEX = "sex";
  static final String ETHNICITY_FIELD = "ethnicity";
  static final String STREET_FIELD = "street";
  static final String STATE_FIELD = "state";
  static final String ZIP_CODE = "zip_code";
  static final String PHONE_NUMBER = "phone_number";
  static final String PHONE_NUMBER_TYPE = "phone_number_type";
  static final String EMPLOYED_IN_HEALTHCARE = "employed_in_healthcare";
  static final String RESIDENT_CONGREGATE_SETTING = "resident_congregate_setting";
  static final String GENDER_IDENTITY = "gender_identity";
  static final String ADDRESS_NOTES = "address_notes";

  private static final List<String> requiredFields =
      List.of(
          FIRST_NAME,
          LAST_NAME,
          RACE_FIELD,
          DATE_OF_BIRTH,
          ETHNICITY_FIELD,
          STREET_FIELD,
          STATE_FIELD,
          ZIP_CODE,
          PHONE_NUMBER,
          PHONE_NUMBER_TYPE,
          EMPLOYED_IN_HEALTHCARE,
          RESIDENT_CONGREGATE_SETTING);

  public PatientUploadRow(Map<String, String> rawRow) {
    firstName = getValue(rawRow, FIRST_NAME, isRequired(FIRST_NAME));
    lastName = getValue(rawRow, LAST_NAME, isRequired(LAST_NAME));
    middleName = getValue(rawRow, "middle_name", isRequired("middle_name"));
    suffix = getValue(rawRow, "suffix", isRequired("suffix"));
    race = getValue(rawRow, RACE_FIELD, isRequired(RACE_FIELD));
    dateOfBirth = getValue(rawRow, DATE_OF_BIRTH, isRequired(DATE_OF_BIRTH));
    sex = getValue(rawRow, SEX, isRequired(SEX));
    ethnicity = getValue(rawRow, ETHNICITY_FIELD, isRequired(ETHNICITY_FIELD));
    street = getValue(rawRow, STREET_FIELD, isRequired(STREET_FIELD));
    street2 = getValue(rawRow, "street_2", isRequired("street_2"));
    city = getValue(rawRow, "city", isRequired("city"));
    county = getValue(rawRow, "county", isRequired("county"));
    state = getValue(rawRow, STATE_FIELD, isRequired(STATE_FIELD));
    zipCode = getValue(rawRow, ZIP_CODE, isRequired(ZIP_CODE));
    country = getValue(rawRow, "country", isRequired("country"));
    phoneNumber = getValue(rawRow, PHONE_NUMBER, isRequired(PHONE_NUMBER));
    phoneNumberType = getValue(rawRow, PHONE_NUMBER_TYPE, isRequired(PHONE_NUMBER_TYPE));
    employedInHealthcare =
        getValue(rawRow, EMPLOYED_IN_HEALTHCARE, isRequired(EMPLOYED_IN_HEALTHCARE));
    residentCongregateSetting =
        getValue(rawRow, RESIDENT_CONGREGATE_SETTING, isRequired(RESIDENT_CONGREGATE_SETTING));
    role = getValue(rawRow, "role", isRequired("role"));
    email = getValue(rawRow, "email", isRequired("email"));
    genderIdentity = getValue(rawRow, GENDER_IDENTITY, isRequired("genderIdentity"));
    notes = getValue(rawRow, ADDRESS_NOTES, isRequired("notes"));
  }

  @Override
  public List<String> getRequiredFields() {
    return requiredFields;
  }

  @Override
  public List<FeedbackMessage> validateRequiredFields() {
    return getPossibleErrorsFromFields();
  }

  @Override
  public Boolean isRequired(String rowName) {
    return requiredFields.contains(rowName);
  }

  @Override
  public List<FeedbackMessage> validateIndividualValues() {
    var errors = new ArrayList<FeedbackMessage>();
    // demographics
    errors.addAll(validateFlexibleDate(dateOfBirth));
    errors.addAll(validateRace(race));
    errors.addAll(validateSex(sex));
    errors.addAll(validateEthnicity(ethnicity));
    errors.addAll(validateGenderIdentity(genderIdentity));

    // housing, work, and role
    errors.addAll(validateYesNoUnknownAnswer(residentCongregateSetting));
    errors.addAll(validateYesNoUnknownAnswer(employedInHealthcare));
    errors.addAll(validateRole(role));

    if (!isAddressUnknown(state.getValue(), zipCode.getValue(), street.getValue())) {
      // address
      errors.addAll(validateState(state));
      errors.addAll(validateZipCode(zipCode));
      errors.addAll(validateCountry(country));
      // check if partial unknown address values
      errors.addAll(validatePartialUnkAddress(state, zipCode, street));
    }

    // contact info
    errors.addAll(validatePhoneNumber(phoneNumber));
    errors.addAll(validatePhoneNumberType(phoneNumberType));
    errors.addAll(validateEmail(email));

    return errors;
  }
}
