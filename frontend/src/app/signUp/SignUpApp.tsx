import { Route, RouteComponentProps } from "react-router-dom";

import PrimeErrorBoundary from "../PrimeErrorBoundary";
import Page from "../commonComponents/Page/Page";

import Consent from "./IdentityVerification/Consent";

const SignUpApp: React.FC<RouteComponentProps> = ({ match: { path } }) => {
  return (
    <PrimeErrorBoundary>
      <Page>
        <Route
          path={`${path}/identity-verification`}
          exact
          component={Consent}
        />
      </Page>
    </PrimeErrorBoundary>
  );
};

export default SignUpApp;
