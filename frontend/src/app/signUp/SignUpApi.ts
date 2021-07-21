import FetchClient from "../utils/api";

import { answersToArray } from "./IdentityVerification/utils";

const api = new FetchClient("/identity-verification");

export class SignUpApi {
  static getQuestions(
    personalDetails: IdentityVerificationRequest
  ): Promise<{ questionSet: Question[] }> {
    return api.request("/get-questions", personalDetails);
  }
  static submitAnswers(
    answers: Answers
  ): Promise<{ passed: boolean; email: string }> {
    return api.request("/submit-answers", { answers: answersToArray(answers) });
  }
}
