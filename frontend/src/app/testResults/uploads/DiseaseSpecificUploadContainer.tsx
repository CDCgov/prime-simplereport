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
          New: Report flu and RSV results to California
        </h2>
        <div className="usa-alert__text">
          <p>
            Organizations sending results to the California Department of Public
            Health (CDPH) can now use the bulk results upload feature to report
            positive flu and RSV tests. Report COVID-19, flu A and B, and RSV
            results all from a single spreadsheet.{" "}
            <a
              href="https://www.simplereport.gov/assets/resources/bulk_results_upload_guide-flu_pilot.pdf"
              onClick={() => {
                appInsights?.trackEvent({
                  name: "Access bulk uploader flu guide",
                });
              }}
            >
              See more information and guidance about flu and RSV reporting
            </a>
            .
          </p>
          <p>
            All organizations can continue to report COVID-19 results to their
            public health department using the bulk uploader. Flu and RSV
            reporting will be available in other jurisdictions soon.
          </p>
        </div>
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
