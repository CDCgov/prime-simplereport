import { FunctionComponent, useEffect } from "react";
import { useDispatch, connect, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { validate as isValidUUID } from "uuid";
import { useTranslation } from "react-i18next";

import Page from "../app/commonComponents/Page/Page";
import { setInitialState } from "../app/store";
import PageNotFound from "../app/commonComponents/PageNotFound";
import Alert from "../app/commonComponents/Alert";
import { getPatientLinkIdFromUrl } from "../app/utils/url";

import PatientHeader from "./PatientHeader";
import TermsOfService from "./timeOfTest/TermsOfService";
import DOB from "./timeOfTest/DOB";
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
  const testResult = useSelector((state: any) => state.testResult);
  const auth = !!testResult.testEventId;

  useEffect(() => {
    dispatch(
      setInitialState({
        plid: getPatientLinkIdFromUrl(),
      })
    );
  });

  if (!isValidUUID(plid)) {
    return (
      <Page
        header={<PatientHeader />}
        children={
          <div className="grid-container maxw-tablet">
            <p></p>
            <Alert
              type="error"
              title="Page not found"
              body={t("testResult.dob.linkNotFound")}
            />
          </div>
        }
        isPatientApp={true}
      />
    );
  }

  return (
    <Page
      header={<PatientHeader />}
      children={
        <PatientLinkURL404Wrapper plid={plid}>
          <Routes>
            <Route path="/" element={<TermsOfService />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="birth-date-confirmation" element={<DOB />} />
            <Route
              path="test-result"
              element={<GuardedRoute auth={auth} element={<TestResult />} />}
            />
          </Routes>
        </PatientLinkURL404Wrapper>
      }
    />
  );
};

export default connect()(PatientApp);
