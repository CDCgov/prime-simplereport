import React from "react";

import { FileUploadService } from "../../../fileUploadService/FileUploadService";
import { getAppInsights } from "../../TelemetryService";

import UploadForm from "./UploadForm";

const DiseaseSpecificUploadContainer = () => {
  const appInsights = getAppInsights();

  const alert = (
    <div className="usa-alert usa-alert--info margin-left-105em margin-right-105em maxw-tablet-lg">
      <div className="usa-alert__body">
        <h2 className="usa-alert__heading">
          New: Report flu results to California
        </h2>
        <p className="usa-alert__text">
          Organizations sending results to the California Department of Public
          Health (CDPH) can now use the bulk results upload feature to report
          positive flu tests. Report COVID-19, flu A, and flu B results all from
          a single spreadsheet.&nbsp;
          <a
            href="https://www.simplereport.gov/assets/resources/bulk_results_upload_guide-flu_pilot.pdf"
            onClick={() => {
              appInsights?.trackEvent({
                name: "Access bulk uploader flu guide",
              });
            }}
          >
            See more information and guidance about flu reporting
          </a>
          .
          <br />
          <br />
          All organizations can continue to report COVID-19 results to their
          public health department using the bulk uploader. Flu reporting will
          be available in other jurisdictions soon.
        </p>
      </div>
    </div>
  );
  return (
    <UploadForm
      alert={alert}
      uploadResults={FileUploadService.uploadResults}
      uploadType={"Disease Specific"}
      spreadsheetTemplateLocation={
        "/assets/resources/test_results_example_10-3-2022.csv"
      }
      uploadGuideLocation={"/results/upload/submit/guide"}
    />
  );
};
export default DiseaseSpecificUploadContainer;
