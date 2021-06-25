import { useState, useEffect } from "react";

import SignUpApi from "../SignUpApiService";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import QuestionsForm from "./QuestionsForm";

const QuestionsFromContainer = () => {
  const [loading, setLoading] = useState(true);
  const [questionSet, setQuestionSet] = useState<Question[] | undefined>();

  const getQuestionSet = async () => {
    const { questionSet } = await SignUpApi.getQuestions();
    if (!questionSet) {
      return;
    }
    setQuestionSet(questionSet);
    setLoading(false);
  };

  useEffect(() => {
    getQuestionSet();
  }, []);

  const onSubmit = async () => {
    await SignUpApi.submitAnswers();
  };

  if (loading) {
    return <LoadingCard message="Loading..." />;
  }
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
};

export default QuestionsFromContainer;
