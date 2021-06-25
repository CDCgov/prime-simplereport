import FetchClient from "../utils/api";

const api = new FetchClient("/identity-verification");

class SignUpApi {
  static getQuestions(): Promise<{ questionSet: Question[] }> {
    return api.request("/get-questions", {});
  }
  static submitAnswers(): Promise<void> {
    return api.request("/submit-answers", {});
  }
}

export default SignUpApi;
