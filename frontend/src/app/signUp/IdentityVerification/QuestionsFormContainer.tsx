import { useState, useEffect } from "react";
import { PhoneNumberUtil } from "google-libphonenumber";

import { SignUpApi } from "../SignUpApi";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import Success from "./Success";
import NextSteps from "./NextSteps";
import QuestionsForm from "./QuestionsForm";
import { answersToArray } from "./utils";

interface Props {
  personalDetails: IdentityVerificationRequest;
  orgExternalId: string;
  timeToComplete?: number;
  disableTimer?: boolean;
}

// Experian doesn't accept names with accents, so we allow users to input them
// but remove the accent before sending to the backend.
function removeAccents(str: string) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function normalizeIdentityVerificationRequest(
  request: IdentityVerificationRequest
) {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const number = phoneUtil.parseAndKeepRawInput(request.phoneNumber, "US");
  request.phoneNumber = `${number.getNationalNumber()}`;
  request.firstName = removeAccents(request.firstName);
  request.middleName = request.middleName
    ? removeAccents(request.middleName)
    : request.middleName;
  request.lastName = removeAccents(request.lastName);
}

const QuestionsFormContainer = ({
  personalDetails,
  orgExternalId,
  timeToComplete,
  disableTimer,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [identificationVerified, setIdentificationVerified] = useState<
    boolean | undefined
  >();
  const [questionSet, setQuestionSet] = useState<Question[] | undefined>();
  const [sessionId, setSessionId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [activationToken, setActivationToken] = useState<string>("");

  const getQuestionSet = async (request: IdentityVerificationRequest) => {
    normalizeIdentityVerificationRequest(request);
    try {
      const response = await SignUpApi.getQuestions(request);
      if (!response.questionSet) {
        return;
      }
      setQuestionSet(response.questionSet);
      setSessionId(response.sessionId);
    } catch (error: any) {
      setIdentificationVerified(false);
    }
    setLoading(false);
    window.scrollTo(0, 0);
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
      setActivationToken(response.activationToken);
    } catch (error: any) {
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
        onFail={() => onSubmit({})}
        timeToComplete={timeToComplete}
        disableTimer={disableTimer}
      />
    );
  }

  if (identificationVerified && email && activationToken) {
    return <Success email={email} activationToken={activationToken} />;
  } else if (identificationVerified) {
    return <Success email={email} />;
  } else {
    return <NextSteps />;
  }
};

export default QuestionsFormContainer;
