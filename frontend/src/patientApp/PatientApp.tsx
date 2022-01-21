import { FunctionComponent, useEffect } from "react";
import { useDispatch, connect, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
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
        <Routes>
          <Route path="/" element={<TermsOfService />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="birth-date-confirmation" element={<DOB />} />
          <Route
            path="patient-info-confirm"
            element={
              <GuardedRoute auth={auth} element={<PatientProfileContainer />} />
            }
          />
          <Route
            path="patient-info-edit"
            element={
              <GuardedRoute auth={auth} element={<PatientFormContainer />} />
            }
          />
          <Route
            path="patient-info-symptoms"
            element={
              <GuardedRoute auth={auth} element={<AoEPatientFormContainer />} />
            }
          />
          <Route
            path="success"
            element={<GuardedRoute auth={auth} element={<PatientLanding />} />}
          />
          <Route
            path="test-result"
            element={<GuardedRoute auth={auth} element={<TestResult />} />}
          />
        </Routes>
      </PatientLinkURL404Wrapper>
    </Page>
  );
};

export default connect()(PatientApp);
