import { getAppInsights } from "../TelemetryService";

import Alert from "./Alert";
import "./DataRetentionLimitsBanner.scss";
import { DATA_RETENTION_LIMITS_INFO_LINK } from "./DataRetentionModal";

interface Props {
  dataRetained: string;
}

export const DataRetentionLimitsBanner = ({ dataRetained }: Props) => {
  const appInsights = getAppInsights();

  const handleSupportClick = () => {
    if (appInsights) {
      appInsights.trackEvent({
        name: "Data Retention Limits",
        properties: {
          source: `${dataRetained} data retention limits banner`,
          link: DATA_RETENTION_LIMITS_INFO_LINK,
        },
      });
    }
  };

  return (
    <Alert
      type="error"
      role="alert"
      className={
        "width-full margin-bottom-2em margin-top-1em data-retention-limits-alert"
      }
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
        target="_blank"
        rel="noopener noreferrer"
        href={DATA_RETENTION_LIMITS_INFO_LINK}
        onClick={handleSupportClick}
      >
        {"Learn how to prepare for data retention limits."}
      </a>
    </Alert>
  );
};
