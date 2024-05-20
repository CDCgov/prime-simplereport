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
  GetPatientsLastResult: graphql.query("GetPatientsLastResult", () => {
    return HttpResponse.json({
      data: {
        patient: { lastTest: {} },
      },
    });
  }),
  SendPatientLinkSms: graphql.mutation("sendPatientLinkSms", () => {
    return HttpResponse.json({
      data: {},
    });
  }),
  UpdateAOE: graphql.mutation("UpdateAOE", () => {
    return HttpResponse.json({
      data: {},
    });
  }),
  EditQueueItem: graphql.mutation("EditQueueItem", () => {
    return HttpResponse.json({
      data: {},
    });
  }),
  RemovePatientFromQueue: graphql.mutation("RemovePatientFromQueue", () => {
    return HttpResponse.json({
      data: {},
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
  GetUploadSubmission: graphql.query("GetUploadSubmission", ({ variables }) => {
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
  getEntityName: http.get(`${BACKEND_URL}/pxp/register/entity-name*`, () => {
    return HttpResponse.json("Shady Oaks", { status: 200 });
  }),
  duplicateRegistration: http.post(
    `${BACKEND_URL}/pxp/register/existing-patient`,
    () => {
      return HttpResponse.json(true, { status: 200 });
    }
  ),
  uniqueRegistration: http.post(
    `${BACKEND_URL}/pxp/register/existing-patient`,
    () => {
      return HttpResponse.json(false, { status: 200 });
    }
  ),
  register: http.post(`${BACKEND_URL}/pxp/register`, () => {
    return HttpResponse.json({}, { status: 200 });
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
