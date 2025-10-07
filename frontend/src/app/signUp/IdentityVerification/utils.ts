import moment from "moment";
import * as yup from "yup";

import { phoneNumberIsValid } from "../../patients/personSchema";
import { isValidDate } from "../../utils/date";

export const getAnswerKey = (index: number) => `answer${index + 1}`;

// Takes date in format YYYY-MM-DD
export function isValidBirthdate(date: string | undefined) {
  if (date === undefined || date === "") {
    return false;
  }
  if (date.split("-").length === 3 && date.split("-")[0].length < 4) {
    return false;
  }
  if (!isValidDate(date)) {
    return false;
  }
  const parsedDate = moment(date, "YYYY-MM-DD");
  if (parsedDate.year() < 1900) {
    return false;
  }
  if (parsedDate.isAfter(moment())) {
    return false;
  }
  return true;
}

export const toOptions = (
  choices: string[]
): { value: string; label: string }[] =>
  choices.map((choice, index) => {
    return { value: String(index + 1), label: choice };
  });

export const initAnswers = (questionSet: Question[]): Nullable<Answers> =>
  questionSet.reduce((answers, _question, index) => {
    answers[getAnswerKey(index)] = null;
    return answers;
  }, {} as Nullable<Answers>);

export const buildSchema = (questionSet: Question[]): yup.SchemaOf<Answers> =>
  yup.object(
    questionSet.reduce((answers, _question, index) => {
      answers[getAnswerKey(index)] = yup
        .string()
        .nullable()
        .required("This field is required");
      return answers;
    }, {} as { [key: string]: any })
  );

// Put the questions in the same order as received from the server
// Then parse the answers in the same order
export const answersToArray = (answers: Answers): number[] =>
  Object.keys(answers)
    .sort()
    .map((key) => parseInt(answers[key]));

export const initPersonalDetails = (
  orgExternalId: string,
  firstName: string,
  middleName: string,
  lastName: string
): IdentityVerificationRequest => ({
  firstName,
  middleName,
  lastName,
  dateOfBirth: "",
  email: "",
  phoneNumber: "",
  streetAddress1: "",
  city: "",
  state: "",
  zip: "",
  orgExternalId,
});

export const initPersonalDetailsErrors = (): Record<
  keyof IdentityVerificationRequest,
  string
> => ({
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phoneNumber: "",
  streetAddress1: "",
  streetAddress2: "",
  city: "",
  state: "",
  zip: "",
  orgExternalId: "",
});

// this is the regex experian uses for street validation
const experianStreetRegex = new RegExp("^([a-zA-Z0-9# \\-'.]{1,60})$", "m");

// this is the regex experian uses for zip validation
const experianZipRegex = new RegExp("^([\\d]{5}([\\-]?[\\d]{4})?){1}$", "m");

export const personalDetailsSchema: yup.SchemaOf<IdentityVerificationRequest> =
  yup.object().shape({
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().nullable(),
    lastName: yup.string().required("Last name is required"),
    dateOfBirth: yup
      .string()
      .test("birth-date", "A valid date of birth is required", isValidBirthdate)
      .required("A valid date of birth is required"),
    email: yup
      .string()
      .email("A valid email address is required")
      .required("A valid email address is required"),
    phoneNumber: yup
      .mixed()
      .test(
        "phone-number",
        "A valid phone number is required",
        phoneNumberIsValid
      )
      .required(),
    streetAddress1: yup
      .string()
      .matches(experianStreetRegex, "A valid street address is required")
      .required("A valid street address is required"),
    streetAddress2: yup
      .string()
      .nullable()
      .notRequired()
      .matches(experianStreetRegex, {
        message: "Street 2 contains invalid symbols",
        excludeEmptyString: true,
      }),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zip: yup
      .string()
      .matches(experianZipRegex, "A valid ZIP code is required")
      .required("A valid ZIP code is required"),
    orgExternalId: yup.string().required("Organization ID is required"),
  });
