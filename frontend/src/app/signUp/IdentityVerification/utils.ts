import * as yup from "yup";

const EXPERIAN_ANSWER_KEY = "outWalletAnswer";

export const getAnswerKey = (index: number) =>
  `${EXPERIAN_ANSWER_KEY}${index + 1}`;

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

// Note: the order of the answers must be preserved
export const answersToArray = (answers: Answers): string[] =>
  Object.keys(answers).map((_, index) => {
    return answers[getAnswerKey(index)];
  });

export const personalDetailsFields = [
  ["firstName", "First name", true, "Legal name"],
  ["middleName", "Middle name", false, null],
  ["lastName", "Last name", true, null],
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

export const initPersonalDetails = (): IdentityVerificationRequest => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phoneNumber: "",
  streetAddress1: "",
  city: "",
  state: "",
  zip: "",
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
});

export const personalDetailsSchema: yup.SchemaOf<IdentityVerificationRequest> = yup
  .object()
  .shape({
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().nullable(),
    lastName: yup.string().required("Last name is required"),
    dateOfBirth: yup.string().required("Birth date is required"),
    email: yup.string().email().required("Email is required"),
    phoneNumber: yup.string().required("Phone number is required"),
    streetAddress1: yup.string().required("Street address is required"),
    streetAddress2: yup.string().nullable(),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zip: yup.string().required("ZIP code is required"),
  });
