import FetchClient from "../utils/api";

import {
  OrganizationCreateRequest,
  OrganizationCreateResponse,
} from "./Organization/OrganizationForm";

const api = new FetchClient();

export class SignUpApi {
  static getQuestions(
    personalDetails: IdentityVerificationRequest
  ): Promise<{ sessionId: string; questionSet: Question[] }> {
    return api.request("/identity-verification/get-questions", personalDetails);
  }
  static submitAnswers(
    request: IdentityVerificationAnswersRequest
  ): Promise<{ passed: boolean; email: string }> {
    return api.request("/identity-verification/submit-answers", request);
  }

  static async createOrganization(
    request: OrganizationCreateRequest
  ): Promise<OrganizationCreateResponse> {
    return api.request(
      "/account-request/without-facility-with-emails",
      request
    );
  }
}
