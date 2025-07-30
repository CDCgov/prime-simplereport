import Alert from "./Alert";

import "./DataRetentionLimitsBanner.scss";
import { getAppInsights } from "../TelemetryService";

interface Props {
  dataRetained: string;
}

export const DataRetentionLimitsBanner = ({ dataRetained }: Props) => {
  const appInsights = getAppInsights();

  const handleSupportClick = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Data Retention Limits" });
      console.log("handle support click worked!!!!!");
    }
  };

  return (
    <>
      {
        <div className="prime-home grid-row width-full margin-bottom-1em">
          <Alert
            type="warning"
            role="alert"
            className={"width-full margin-bottom-40px"}
            bodyClassName={"data-retention-limits-alert-body"}
          >
            <strong className={"data-retention-limits-header"}>
              {"Beginning November 1st, 2025, "} {dataRetained}{" "}
              {" will only be stored for 30 days"}
              <br />
            </strong>
            {"This change may impact how your facility uses SimpleReport. "}
            <a
              className={"data-retention-limits-link"}
              href={
                "https://dev5.simplereport.gov/using-simplereport/data-retention-limits/"
              }
              onClick={handleSupportClick}
            >
              {"Learn how to prepare for data retention limits."}
            </a>
          </Alert>
        </div>
      }
    </>
  );
};
