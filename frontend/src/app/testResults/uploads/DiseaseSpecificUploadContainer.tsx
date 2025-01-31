import React from "react";

import { FileUploadService } from "../../../fileUploadService/FileUploadService";
import { getAppInsights } from "../../TelemetryService";
import { BULK_UPLOAD_SUPPORTED_DISEASES_COPY_TEXT } from "../../../config/constants";

import UploadForm from "./UploadForm";

const DiseaseSpecificUploadContainer = () => {
  const appInsights = getAppInsights();

  const alert = (
    <div className="usa-alert usa-alert--info margin-left-105em margin-right-105em maxw-tablet-lg">
      <div className="usa-alert__body">
        <h2 className="usa-alert__heading">
          New: Report flu and RSV results in select jurisdictions
        </h2>
        <div className="usa-alert__text">
          <p>
            SimpleReport allows organizations to report{" "}
            {BULK_UPLOAD_SUPPORTED_DISEASES_COPY_TEXT} results all from a single
            spreadsheet to a growing number of jurisdictions. To check if your
            jurisdiction is currently supported, please refer to the "Test for
            Other Diseases" section in the{" "}
            <a
              href={
                "https://www.simplereport.gov/using-simplereport/test-for-other-diseases/influenza/"
              }
            >
              SimpleReport online user guide
            </a>
            .{" "}
            <a
              href="https://www.simplereport.gov/assets/resources/bulk_results_upload_guide-flu_pilot.pdf"
              onClick={() => {
                appInsights?.trackEvent({
                  name: "Access bulk uploader flu guide",
                });
              }}
            >
              See more information and guidance about reporting these diseases
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
        "/assets/resources/test_results_example_01-31-2025.csv"
      }
      uploadGuideLocation={"/results/upload/submit/guide"}
    />
  );
};
export default DiseaseSpecificUploadContainer;
