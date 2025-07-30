import { NavLink } from "react-router-dom";

import Alert from "./Alert";

import "./DataRetentionLimitsBanner.scss";

interface Props {
  dataRetained: string;
}

export const DataRetentionLimitsBanner = ({ dataRetained }: Props) => {
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
            <NavLink to="/using-simplereport/data-retention-limits">
              <a
                className={"data-retention-limits-link"}
                href={"data-retention-limits-info"}
              >
                {"Learn how to prepare for data retention limits."}
              </a>
            </NavLink>
          </Alert>
        </div>
      }
    </>
  );
};
