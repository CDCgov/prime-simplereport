import { useEffect, useState } from "react";

import FetchClient from "./utils/api";

export const APP_STATUS_LOADING = "App status loading...";
export const APP_STATUS_SUCCESS = "App status returned success :)";
export const APP_STATUS_FAILURE = "App status returned failure :(";

export const OKTA_STATUS_LOADING = "Okta status loading...";
export const OKTA_STATUS_SUCCESS = "Okta status returned success :)";
export const OKTA_STATUS_FAILURE = "Okta status returned failure :(";

const api = new FetchClient(undefined, { mode: "cors" });
const DeploySmokeTest = (): JSX.Element => {
  const [appStatus, setAppStatus] = useState<boolean>();
  const [oktaStatus, setOktaStatus] = useState<boolean>();

  useEffect(() => {
    api
      .getRequest("/actuator/health/backend-and-db-smoke-test")
      .then((response) => {
        const status = JSON.parse(response);
        if (status.status === "UP") return setAppStatus(true);
        setAppStatus(false);
      })
      .catch((e) => {
        console.error(e);
        setAppStatus(false);
      });
  }, []);

  useEffect(() => {
    api
      .getRequest("/actuator/health")
      .then((response) => {
        const status = JSON.parse(response);
        if (status.okta === "UP") return setOktaStatus(true);
        setOktaStatus(false);
      })
      .catch((e) => {
        console.error(e);
        setOktaStatus(false);
      });
  }, []);

  let appStatusMessage;
  switch (appStatus) {
    case undefined:
      appStatusMessage = APP_STATUS_LOADING;
      break;
    case true:
      appStatusMessage = APP_STATUS_SUCCESS;
      break;
    case false:
      appStatusMessage = APP_STATUS_FAILURE;
      break;
  }
  let oktaStatusMessage;
  switch (oktaStatus) {
    case undefined:
      oktaStatusMessage = OKTA_STATUS_LOADING;
      break;
    case true:
      oktaStatusMessage = OKTA_STATUS_SUCCESS;
      break;
    case false:
      oktaStatusMessage = OKTA_STATUS_FAILURE;
      break;
  }
  return (
    <>
      <div className={"display-block"}>{appStatusMessage} </div>
      <div className={"display-block"}> {oktaStatusMessage} </div>
    </>
  );
};

export default DeploySmokeTest;
