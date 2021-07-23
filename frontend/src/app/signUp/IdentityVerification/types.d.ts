interface Question {
  questionType: number;
  questionText: string;
  questionSelect: {
    questionChoice: string[];
  };
}

interface Answers {
  [answerIndex: string]: string;
}

interface IdentityVerificationAnswersRequest {
  answers: number[];
  orgExternalId: string;
  sessionId: string;
}

interface IdentityVerificationRequest {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string | null;
  city: string;
  state: string;
  zip: string;
  orgExternalId: string;
}
