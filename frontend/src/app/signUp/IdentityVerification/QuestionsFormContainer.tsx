import { useState, useEffect } from "react";

import { SignUpApi } from "../SignUpApi";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import QuestionsForm from "./QuestionsForm";
import Success from "./Success";
import NextSteps from "./NextSteps";

const QuestionsFormContainer = () => {
  const [loading, setLoading] = useState(true);
  const [identificationVerified, setIdentificationVerified] = useState<
    boolean | undefined
  >();
  const [questionSet, setQuestionSet] = useState<Question[] | undefined>();
  const [email, setEmail] = useState<string>("");

  const getQuestionSet = async () => {
    const response = await SignUpApi.getQuestions();
    if (!response.questionSet) {
      return;
    }
    setQuestionSet(response.questionSet);
    setLoading(false);
  };

  useEffect(() => {
    getQuestionSet();
  }, []);

  const onSubmit = async (answers: Answers) => {
    setLoading(false);
    const response = await SignUpApi.submitAnswers(answers);
    setIdentificationVerified(!response.passed);
    setEmail(response.email);
  };

  if (loading) {
    return <LoadingCard message="Loading..." />;
  }
  if (identificationVerified === undefined) {
    if (!questionSet) {
      return <p>Error: unable to load questions</p>;
    }
    return (
      <QuestionsForm
        questionSet={questionSet}
        saving={false}
        onSubmit={onSubmit}
      />
    );
  }
  if (identificationVerified) {
    return <Success email={email} />;
  } else {
    return <NextSteps />;
  }
};

export default QuestionsFormContainer;
