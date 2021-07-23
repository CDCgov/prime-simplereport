import FetchClient from "../utils/api";

const api = new FetchClient("/identity-verification");

export class SignUpApi {
  static getQuestions(
    personalDetails: IdentityVerificationRequest
  ): Promise<{ sessionId: string; questionSet: Question[] }> {
    return api.request("/get-questions", personalDetails);
  }
  static submitAnswers(
    request: IdentityVerificationAnswersRequest
  ): Promise<{ passed: boolean; email: string }> {
    return api.request("/submit-answers", request);
  }
}
