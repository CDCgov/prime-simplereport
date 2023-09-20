import React from "react";

import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";

import UploadForm from "./UploadForm";

const AgnosticUploadContainer = () => {
  const alert = (
    <div className="usa-alert usa-alert--info margin-left-105em margin-right-105em maxw-tablet-lg">
      <div className="usa-alert__body">
        <h2 className="usa-alert__heading">
          What is the bulk results uploader?
        </h2>
        <p className="usa-alert__text">
          <em>
            This feature is in beta. That means it’s new, and we’ll continue to
            update and improve it for our users. Though the feature is in beta,
            it will route all the results you submit to the appropriate public
            health department(s).
          </em>{" "}
          <br />
          <br /> The results uploader allows you to report test results in bulk
          using a CSV file. While we expect most SimpleReport users will
          continue to report through the regular process, this feature can serve
          labs and others with an information system that exports spreadsheets,
          such as an EMR.{" "}
          <LinkWithQuery to="/results/upload/submit/guide">
            <strong>Learn more about how it works</strong>
          </LinkWithQuery>
          .
        </p>
      </div>
    </div>
  );
  return (
    <UploadForm
      alert={alert}
      uploadType={"Agnostic"}
      spreadsheetTemplateLocation={""}
      uploadGuideLocation={""}
      uploadResults={(_file) => {
        return Promise.resolve(new Response());
      }}
    />
  );
};

export default AgnosticUploadContainer;
