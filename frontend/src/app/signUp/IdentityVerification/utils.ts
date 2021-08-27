import moment from "moment";
import * as yup from "yup";

import { phoneNumberIsValid } from "../../patients/personSchema";

export const getAnswerKey = (index: number) => `answer${index + 1}`;

export function isValidBirthdate(date: string | undefined) {
  if (date === undefined) {
    return false;
  }
  if (date.split("/").length === 3 && date.split("/")[2].length < 4) {
    return false;
  }
  const parsedDate = moment(date);
  if (!parsedDate.isValid()) {
    return false;
  }
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

export const personalDetailsFields = [
  ["dateOfBirth", "Date of birth", true, null],
  ["email", "Email", true, "Personal contact information"],
  ["phoneNumber", "Phone number", true, null],
  ["streetAddress1", "Street address 1", true, "Home address"],
  ["streetAddress2", "Street address 2", false, null],
  ["city", "City", true, null],
  ["state", "State", true, null],
  ["zip", "ZIP code", true, null],
].reduce((fields, field) => {
  fields[field[0] as keyof IdentityVerificationRequest] = {
    label: field[1] as string,
    required: field[2] as boolean,
    preheader: field[3] as string | null,
  };
  return fields;
}, {} as { [key: string]: { label: string; required: boolean; preheader: string | null } });

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

export const personalDetailsSchema: yup.SchemaOf<IdentityVerificationRequest> = yup
  .object()
  .shape({
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
    streetAddress1: yup.string().required("Street address is required"),
    streetAddress2: yup.string().nullable(),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zip: yup.string().required("ZIP code is required"),
    orgExternalId: yup.string().required("Organization ID is required"),
  });
