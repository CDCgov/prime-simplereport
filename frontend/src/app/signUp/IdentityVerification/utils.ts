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
