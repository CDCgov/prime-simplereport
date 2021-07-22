import { useState, useEffect } from "react";

import { SignUpApi } from "../SignUpApi";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import Success from "./Success";
import NextSteps from "./NextSteps";
import QuestionsForm from "./QuestionsForm";
import { answersToArray } from "./utils";

interface Props {
  personalDetails: IdentityVerificationRequest;
  orgExternalId: string;
}

const QuestionsFormContainer = ({ personalDetails, orgExternalId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [identificationVerified, setIdentificationVerified] = useState<
    boolean | undefined
  >();
  const [questionSet, setQuestionSet] = useState<Question[] | undefined>();
  const [sessionId, setSessionId] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const getQuestionSet = async (request: IdentityVerificationRequest) => {
    try {
      const response = await SignUpApi.getQuestions(request);
      if (!response.questionSet) {
        return;
      }
      setQuestionSet(response.questionSet);
      setSessionId(response.sessionId);
    } catch (error) {
      setIdentificationVerified(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    getQuestionSet(personalDetails);
  }, [personalDetails]);

  const onSubmit = async (answers: Answers) => {
    setLoading(true);
    const request: IdentityVerificationAnswersRequest = {
      orgExternalId,
      sessionId,

      answers: answersToArray(answers),
    };
    try {
      const response = await SignUpApi.submitAnswers(request);
      setIdentificationVerified(response.passed);
      setEmail(response.email);
    } catch (error) {
      setIdentificationVerified(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingCard message="Submitting ID verification details" />;
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
