import { Route, RouteComponentProps } from "react-router-dom";

import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Page from "../commonComponents/Page/Page";

import QuestionsFormContainer from "./IdentityVerification/QuestionsFormContainer";

const SignUpApp: React.FC<RouteComponentProps> = ({ match: { path } }) => {
  return (
    <PrimeErrorBoundary>
      <Page>
        <Route
          path={`${path}/identity-verification`}
          exact
          component={QuestionsFormContainer}
        />
      </Page>
    </PrimeErrorBoundary>
  );
};

export default SignUpApp;
