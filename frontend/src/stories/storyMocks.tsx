import { graphql, http, HttpResponse } from "msw";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import React from "react";

import { exampleQuestionSet } from "../app/signUp/IdentityVerification/constants";
import { UploadSubmissionPage } from "../generated/graphql";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const mocks = {
  // HTTP GET
  getEntityName: http.get(`${BACKEND_URL}/pxp/register/entity-name*`, () => {
    return HttpResponse.json("Shady Oaks", { status: 200 });
  }),
  getPxpResult: http.get(`${BACKEND_URL}/pxp/entity?patientLink=*`, () => {
    return HttpResponse.json(
      {
        expiresAt: "2024-06-15T15:32:41.260+00:00",
        facility: {
          phone: "(800) 232-4636",
          name: "Testing Site",
        },
        patient: {
          firstName: "Mary",
          lastName: "E.",
        },
      },
      { status: 200 }
    );
  }),
  // HTTP POST
  duplicateRegistration: http.post(
    `${BACKEND_URL}/pxp/register/existing-patient`,
    () => {
      return HttpResponse.json(true, { status: 200 });
    }
  ),
  enrollEmailMfa: http.post(
    `${BACKEND_URL}/user-account/enroll-email-mfa`,
    () => {
      return HttpResponse.json(
        { activation: { storybook: true } },
        { status: 200 }
      );
    }
  ),
  enrollSecurityKeyMfa: http.post(
    `${BACKEND_URL}/user-account/enroll-security-key-mfa`,
    () => {
      return HttpResponse.json(
        { activation: { storybook: true } },
        { status: 200 }
      );
    }
  ),
  enrollTotpMfa: http.post(
    `${BACKEND_URL}/user-account/authenticator-qr`,
    () => {
      return HttpResponse.json(
        { qrcode: "https://i.redd.it/tvfnlka65zi51.jpg" },
        { status: 200 }
      );
    }
  ),
  getQuestions: http.post(
    `${BACKEND_URL}/identity-verification/get-questions`,
    () => {
      return HttpResponse.json(
        { questionSet: exampleQuestionSet },
        { status: 200 }
      );
    }
  ),
  register: http.post(`${BACKEND_URL}/pxp/register`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  uniqueRegistration: http.post(
    `${BACKEND_URL}/pxp/register/existing-patient`,
    () => {
      return HttpResponse.json(false, { status: 200 });
    }
  ),
  verifyActivationPasscode: http.post(
    `${BACKEND_URL}/user-account/verify-activation-passcode`,
    () => {
      return HttpResponse.json(
        { activation: { storybook: true } },
        { status: 200 }
      );
    }
  ),
  // MUTATIONS
  AddPatient: graphql.mutation("AddPatient", () => {
    return HttpResponse.json({
      data: {
        addPatient: {
          internalId: "2ded0fd4-8953-4fb3-8af8-b702f188301e",
          facility: null,
        },
      },
    });
  }),
  EditQueueItem: graphql.mutation("EditQueueItem", () => {
    return HttpResponse.json({
      data: {
        editQueueItem: {
          results: [
            {
              disease: {
                name: "COVID-19",
              },
              testResult: "POSITIVE",
            },
            {
              disease: {
                name: "Flu B",
              },
              testResult: "NEGATIVE",
            },
            {
              disease: {
                name: "Flu A",
              },
              testResult: "POSITIVE",
            },
          ],
          dateTested: null,
          deviceType: {
            internalId: "bb53de6b-6fb7-43a1-be87-3a026f04f1c1",
            testLength: 15,
          },
        },
      },
    });
  }),
  SubmitQueueItem: graphql.mutation("SubmitQueueItem", () => {
    return HttpResponse.json({
      data: {
        submitQueueItem: {
          testResult: {
            internalId: "82330d381-6788-4dc0-b31f-6f77f8c37954",
          },
          deliverySuccess: true,
          testEventId: "f734f94d-fc1c-4419-9bd3-9d4969e345d3",
        },
      },
    });
  }),
  UpdateAOE: graphql.mutation("UpdateAOE", () => {
    return HttpResponse.json({
      data: {
        updateTimeOfTestQuestions: null,
      },
    });
  }),
  // QUERIES
  GetEmptyUploadSubmissions: graphql.query("GetUploadSubmissions", () => {
    return HttpResponse.json({
      data: {
        uploadSubmissions: {
          content: [],
          totalElements: 0,
        } as UploadSubmissionPage,
      },
    });
  }),
  GetTopLevelDashboardMetricsNew: graphql.query(
    "GetTopLevelDashboardMetricsNew",
    () => {
      return HttpResponse.json({
        data: {
          topLevelDashboardMetrics: {
            positiveTestCount: 64,
            totalTestCount: 562,
          },
        },
      });
    }
  ),
  GetUploadSubmission: graphql.query("GetUploadSubmission", () => {
    return HttpResponse.json({
      data: {
        uploadSubmission: {
          internalId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
          reportId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
          createdAt: "2022-05-05T13:47:09Z",
          status: "SUCCESS",
          recordsCount: 15,
          errors: [],
          warnings: [],
        },
      },
    });
  }),
  GetUploadSubmissions: graphql.query("GetUploadSubmissions", () => {
    return HttpResponse.json({
      data: {
        uploadSubmissions: {
          content: [
            {
              internalId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
              reportId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
              createdAt: "2022-05-05T13:47:09Z",
              status: "PENDING",
              recordsCount: 15,
              errors: [],
              warnings: [],
            },
            {
              internalId: "21bc0220-30d7-47a7-a22f-dfede0c04f19",
              reportId: "21bc0220-30d7-47a7-a22f-dfede0c04f19",
              createdAt: "2022-05-03T13:47:09Z",
              status: "SUCCESS",
              recordsCount: 10,
              errors: [],
              warnings: [],
            },
            {
              internalId: "1e0c8e80-52e9-4f80-9973-841ecebc297a",
              reportId: "1e0c8e80-52e9-4f80-9973-841ecebc297a",
              createdAt: "2022-05-02T13:47:09Z",
              status: "FAILURE",
              recordsCount: 2,
              errors: null,
              warnings: null,
            },
          ],
          totalElements: 3,
        } as UploadSubmissionPage,
      },
    });
  }),
  PatientExists: graphql.query("PatientExists", () => {
    return HttpResponse.json({
      data: {
        patientExistsWithoutZip: false,
      },
    });
  }),
};

export const getMocks = (...names: (keyof typeof mocks)[]) => {
  return {
    handlers: names.map((name) => mocks[name]),
  };
};

export const getAllMocks = () => {
  return Object.values(mocks);
};

export const handlers = getAllMocks();

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: `${BACKEND_URL}/graphql`,
  fetch: (...args) => fetch(...args),
});
const client = new ApolloClient({
  cache,
  link,
});

type StoryGraphQLProviderProps = {
  children: React.ReactNode;
};

export const StoryGraphQLProvider: React.FC<StoryGraphQLProviderProps> = ({
  children,
}) => <ApolloProvider client={client}>{children}</ApolloProvider>;
