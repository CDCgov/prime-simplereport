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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const mocks = {
  EditQueueItem: graphql.mutation("EditQueueItem", (req, res, ctx) => {
    return res(
      ctx.data({
        editQueueItem: {
          result: req.body?.variables.result || null,
          dateTested: req.body?.variables.dateTested || null,
          deviceType: {
            internalId: null,
            testLength: "0.1",
            ...req.body?.variables.deviceType,
          },
        },
      })
    );
  }),
  SubmitTestResult: graphql.mutation(
    "SubmitTestResult",
    async (req, res, ctx) => {
      await new Promise((res) => setTimeout(res, 200));

      const data =
        req.body?.variables.patientId === "this-should-fail"
          ? {}
          : {
              addTestResultNew: {
                internalId: req.body?.variables.patientId,
              },
            };
      return res(ctx.data(data));
    }
  ),
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
export const StoryGraphQLProvider: React.FC = ({ children }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
