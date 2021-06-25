import { FunctionComponent, useEffect } from "react";
import { useDispatch, connect, useSelector } from "react-redux";
import { Route, Switch, RouteComponentProps } from "react-router-dom";

import PrimeErrorBoundary from "../app/PrimeErrorBoundary";
import Page from "../app/commonComponents/Page/Page";
import { setInitialState } from "../app/store";
import { getPatientLinkIdFromUrl } from "../app/utils/url";
import PageNotFound from "../app/commonComponents/PageNotFound";

import PatientHeader from "./PatientHeader";
import TermsOfService from "./timeOfTest/TermsOfService";
import DOB from "./timeOfTest/DOB";
import AoEPatientFormContainer from "./timeOfTest/AoEPatientFormContainer";
import PatientLanding from "./timeOfTest/PatientLanding";
import PatientProfileContainer from "./timeOfTest/PatientProfileContainer";
import PatientFormContainer from "./timeOfTest/PatientFormContainer";
import TestResult from "./timeOfTest/TestResult";
import GuardedRoute from "./GuardedRoute";

interface WrapperProps {
  plid: string;
}
const PatientLinkURL404Wrapper: FunctionComponent<WrapperProps> = ({
  plid,
  children,
}) => {
  if (plid === undefined) {
    return <>Loading...</>;
  }
  if (plid === null) {
    return <PageNotFound />;
  }
  return <>{children}</>;
};

const PatientApp: React.FC<RouteComponentProps> = ({ match }) => {
  const dispatch = useDispatch();
  const plid = useSelector((state: any) => state.plid);
  const patient = useSelector((state: any) => state.patient);
  const auth = patient.internalId !== "";

  useEffect(() => {
    dispatch(
      setInitialState({
        plid: getPatientLinkIdFromUrl(),
      })
    );
  });

  return (
    <PrimeErrorBoundary>
      <Page>
        <PatientHeader />
        <PatientLinkURL404Wrapper plid={plid}>
          <Switch>
            <Route path={`${match.path}`} exact component={TermsOfService} />
            <Route
              path={`${match.path}/terms-of-service`}
              component={TermsOfService}
            />
            <Route
              path={`${match.path}/birth-date-confirmation`}
              component={DOB}
            />
            <GuardedRoute
              auth={auth}
              path={`${match.path}/patient-info-confirm`}
              component={PatientProfileContainer}
            />
            <GuardedRoute
              auth={auth}
              path={`${match.path}/patient-info-edit`}
              component={PatientFormContainer}
            />
            <GuardedRoute
              auth={auth}
              path={`${match.path}/patient-info-symptoms`}
              component={AoEPatientFormContainer}
            />
            <GuardedRoute
              auth={auth}
              path={`${match.path}/success`}
              component={PatientLanding}
            />
            <GuardedRoute
              auth={auth}
              path={`${match.path}/test-result`}
              component={TestResult}
            />
          </Switch>
        </PatientLinkURL404Wrapper>
      </Page>
    </PrimeErrorBoundary>
  );
};

export default connect()(PatientApp);
