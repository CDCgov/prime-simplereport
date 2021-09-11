import { Route, RouteComponentProps } from "react-router-dom";

import Page from "../commonComponents/Page/Page";

import Consent from "./IdentityVerification/Consent";
import Instructions from "./Organization/Instructions";

const SignUpApp: React.FC<RouteComponentProps> = ({ match: { path } }) => {
  return (
    <Page>
      <Route path={`${path}`} exact component={Instructions} />
      <Route path={`${path}/identity-verification`} exact component={Consent} />
    </Page>
  );
};

export default SignUpApp;
