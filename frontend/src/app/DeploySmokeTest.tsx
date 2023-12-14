import { useEffect, useState } from "react";

import FetchClient from "./utils/api";

const api = new FetchClient(undefined, { mode: "cors" });
const DeploySmokeTest = (): JSX.Element => {
  const [success, setSuccess] = useState<boolean>();
  useEffect(() => {
    api
      .getRequest("/actuator/health/prod-smoke-test")
      .then((response) => {
        console.log(response);
        const status = JSON.parse(response);
        if (status.status === "UP") return setSuccess(true);
        // log something using app insights
        setSuccess(false);
      })
      .catch((e) => {
        console.error(e);
        setSuccess(false);
      });
  }, []);

  if (success === undefined) return <>Status loading...</>;
  if (success) return <> Status returned success :) </>;
  return <> Status returned failure :( </>;
};

export default DeploySmokeTest;
