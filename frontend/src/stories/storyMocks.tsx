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
  enrollSecurityKeyMfa: rest.post(
    "http://localhost:8080/user-account/enroll-security-key-mfa",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ activation: { storybook: true } })
      );
    }
  ),
  enrollTotpMfa: rest.post(
    "http://localhost:8080/user-account/authenticator-qr",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ qrcode: "https://i.redd.it/tvfnlka65zi51.jpg" })
      );
    }
  ),
  getQuestions: rest.post(
    "http://localhost:8080/identity-verification/get-questions",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ questionSet: exampleQuestionSet })
      );
    }
  ),
  getEntityName: rest.get(
    "http://localhost:8080/pxp/register/entity-name*",
    (_, res, ctx) => {
      return res(ctx.status(200), ctx.text("Shady Oaks"));
    }
  ),
  duplicateRegistration: rest.post(
    "http://localhost:8080/pxp/register/existing-patient",
    (_, rest, ctx) => {
      return rest(ctx.status(200), ctx.json({ unique: false }));
    }
  ),
  uniqueRegistration: rest.post(
    "http://localhost:8080/pxp/register/existing-patient",
    (_, rest, ctx) => {
      return rest(ctx.status(200), ctx.json({ unique: true }));
    }
  ),
  register: rest.post("http://localhost:8080/pxp/register", (_, rest, ctx) => {
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
  uri: "http://localhost:3000/graphql",
  fetch: (...args) => fetch(...args),
});
const client = new ApolloClient({
  cache,
  link,
});
export const StoryGraphQLProvider: React.FC = ({ children }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
