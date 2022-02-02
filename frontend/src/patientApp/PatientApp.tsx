import { FunctionComponent, useEffect } from "react";
import { useDispatch, connect, useSelector } from "react-redux";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import { validate as isValidUUID } from "uuid";
import { useTranslation } from "react-i18next";

import Page from "../app/commonComponents/Page/Page";
import { setInitialState } from "../app/store";
import { getPatientLinkIdFromUrl } from "../app/utils/url";
import PageNotFound from "../app/commonComponents/PageNotFound";
import Alert from "../app/commonComponents/Alert";

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

const PatientApp = () => {
  const { t } = useTranslation();
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

  if (!isValidUUID(plid)) {
    return (
      <Page>
        <PatientHeader />
        <main>
          <div className="grid-container maxw-tablet">
            <p></p>
            <Alert
              type="error"
              title="Page not found"
              body={t("testResult.dob.linkNotFound")}
            />
          </div>
        </main>
      </Page>
    );
  }

  return (
    <Page>
      <PatientHeader />
      <PatientLinkURL404Wrapper plid={plid}>
        <Router basename={`${process.env.PUBLIC_URL}/pxp`}>
          <Switch>
            <Route path="/" exact component={TermsOfService} />
            <Route path="/terms-of-service" component={TermsOfService} />
            <Route path="/birth-date-confirmation" component={DOB} />
            <GuardedRoute
              auth={auth}
              path="/patient-info-confirm"
              component={PatientProfileContainer}
            />
            <GuardedRoute
              auth={auth}
              path="/patient-info-edit"
              component={PatientFormContainer}
            />
            <GuardedRoute
              auth={auth}
              path="/patient-info-symptoms"
              component={AoEPatientFormContainer}
            />
            <GuardedRoute
              auth={auth}
              path="/success"
              component={PatientLanding}
            />
            <GuardedRoute
              auth={auth}
              path="/test-result"
              component={TestResult}
            />
          </Switch>
        </Router>
      </PatientLinkURL404Wrapper>
    </Page>
  );
};

export default connect()(PatientApp);
