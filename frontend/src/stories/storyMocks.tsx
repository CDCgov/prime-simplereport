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
  SubmitTestResults: graphql.mutation("SubmitTestResults", (req, res, ctx) => {
    return res(
      ctx.data({
        submitTestResults: {
          internalId: req.body?.variables.patientId,
        },
      })
    );
  }),
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
        ctx.json({ activation: enrollSecurityKeyMock })
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

const enrollSecurityKeyMock = {
  attestation: "direct",
  authenticatorSelection: {
    userVerification: "preferred",
    requireResidentKey: false,
  },
  challenge: "cdsZ1V10E0BGE4GcG3IK",
  excludeCredentials: [],
  pubKeyCredParams: [
    {
      type: "public-key",
      alg: -7,
    },
    {
      type: "public-key",
      alg: -257,
    },
  ],
  rp: {
    name: "Rain-Cloud59",
  },
  user: {
    displayName: "First Last",
    name: "first.last@gmail.com",
    id: "00u15s1KDETTQMQYABRL",
  },
};
