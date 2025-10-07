import {
  DefaultRequestBody,
  graphql,
  GraphQLHandler,
  GraphQLRequest,
  MockedRequest,
  rest,
  RestHandler,
} from "msw";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

import { exampleQuestionSet } from "../app/signUp/IdentityVerification/constants";
import { UploadResponse, UploadSubmissionPage } from "../generated/graphql";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const mocks = {
  GetPatientsLastResult: graphql.query(
    "GetPatientsLastResult",
    (req, res, ctx) => {
      return res(ctx.data({ patient: { lastTest: {} } }));
    }
  ),
  SendPatientLinkSms: graphql.mutation("sendPatientLinkSms", (req, res, ctx) =>
    res(ctx.data({}))
  ),
  UpdateAOE: graphql.mutation("UpdateAOE", (req, res, ctx) => {
    return res(ctx.data({}));
  }),
  RemovePatientFromQueue: graphql.mutation(
    "RemovePatientFromQueue",
    (req, res, ctx) => res(ctx.data({}))
  ),
  GetTopLevelDashboardMetricsNew: graphql.query(
    "GetTopLevelDashboardMetricsNew",
    (req, res, ctx) =>
      res(
        ctx.data({
          topLevelDashboardMetrics: {
            positiveTestCount: 64,
            totalTestCount: 562,
          },
        })
      )
  ),
  GetUploadSubmission: graphql.query("GetUploadSubmission", (req, res, ctx) =>
    res(
      ctx.data({
        uploadSubmission: {
          internalId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
          reportId: "e70c3110-15b7-43a1-9014-f07b81c5fce1",
          createdAt: "2022-05-05T13:47:09Z",
          status: "SUCCESS",
          recordsCount: 15,
          errors: [],
          warnings: [],
        } as UploadResponse,
      })
    )
  ),
  GetUploadSubmissions: graphql.query("GetUploadSubmissions", (req, res, ctx) =>
    res(
      ctx.data({
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
      })
    )
  ),
  GetEmptyUploadSubmissions: graphql.query(
    "GetUploadSubmissions",
    (req, res, ctx) =>
      res(
        ctx.data({
          uploadSubmissions: {
            content: [],
            totalElements: 0,
          } as UploadSubmissionPage,
        })
      )
  ),
  enrollSecurityKeyMfa: rest.post(
    `${BACKEND_URL}/user-account/enroll-security-key-mfa`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ activation: { storybook: true } })
      );
    }
  ),
  enrollTotpMfa: rest.post(
    `${BACKEND_URL}/user-account/authenticator-qr`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ qrcode: "https://i.redd.it/tvfnlka65zi51.jpg" })
      );
    }
  ),
  getQuestions: rest.post(
    `${BACKEND_URL}/identity-verification/get-questions`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ questionSet: exampleQuestionSet })
      );
    }
  ),
  getEntityName: rest.get(
    `${BACKEND_URL}/pxp/register/entity-name*`,
    (_, res, ctx) => {
      return res(ctx.status(200), ctx.text("Shady Oaks"));
    }
  ),
  duplicateRegistration: rest.post(
    `${BACKEND_URL}/pxp/register/existing-patient`,
    (_, rest, ctx) => {
      return rest(ctx.status(200), ctx.body("true"));
    }
  ),
  uniqueRegistration: rest.post(
    `${BACKEND_URL}/pxp/register/existing-patient`,
    (_, rest, ctx) => {
      return rest(ctx.status(200), ctx.body("false"));
    }
  ),
  register: rest.post(`${BACKEND_URL}/pxp/register`, (_, rest, ctx) => {
    return rest(ctx.status(200));
  }),
};

export const getMocks = (
  ...names: (keyof typeof mocks)[]
): (
  | GraphQLHandler<GraphQLRequest<any>>
  | RestHandler<MockedRequest<DefaultRequestBody>>
)[] => names.map((name) => mocks[name]);

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
