import { useDocumentTitle } from "../../utils/hooks";

/* eslint-disable jsx-a11y/anchor-has-content */
const CsvUploadGuide = () => {
  useDocumentTitle("CSV Upload Guide");
  return (
    <div className="prime-home">
      <div className="grid-container">
        <div className="prime-container prime-container-padding-2x card-container prose">
          <div className="tablet:grid-col-8 usa-prose">
            <section id="anchor-top">
              <span className="text-base text-italic">
                Updated: January 2022
              </span>
              <h2 className=" margin-top-0">
                CSV upload guide{" "}
                <span className="text-secondary bg-white border-1px border-secondary font-body-3xs padding-x-1 padding-y-05 text-secondary margin-left-2 text-ttbottom">
                  Pilot program{" "}
                </span>
              </h2>
              <p className="usa-intro text-base margin-bottom-4">
                Step-by-step guidance for preparing and uploading test results
                via a standard comma-separated values (CSV) spreadsheet.
              </p>
              <strong>In this guide</strong>
              <ul>
                <li>
                  <a href="#preparing-a-csv" className="usa-link">
                    How to prepare a CSV file for SimpleReport
                  </a>
                </li>
                <li>
                  <a href="#upload-a-csv" className="usa-link">
                    How to upload a CSV file to SimpleReport
                  </a>
                </li>
              </ul>
              <p>
                <strong>Resources</strong>
              </p>
              <ul>
                <li>
                  <a
                    href="https://SimpleReport.cdc.gov/assets/csv/SimpleReport-StandardCSV-ExampleData-20220509.csv"
                    className="usa-link"
                  >
                    SimpleReport CSV template with example data
                  </a>
                </li>
              </ul>
            </section>
            <section>
              <h3
                id="preparing-a-csv"
                className="font-body-lg border-top-1px border-ink margin-top-8 margin-bottom-6 padding-top-1"
              >
                Preparing a CSV file
              </h3>
              <ol className="usa-process-list">
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">
                    Download the SimpleReport CSV template and review the
                    documentation
                  </h4>
                  <p className="margin-top-05">
                    If your jurisdiction already has a set format for CSV,
                    compare it to our{" "}
                    <a
                      href="https://SimpleReport.cdc.gov/assets/csv/SimpleReport-StandardCSV-ExampleData-20220509.csv"
                      className="usa-link"
                    >
                      CSV template file
                    </a>{" "}
                    and{" "}
                    <a href="/getting-started/testing-facilities/csv-schema">
                      {" "}
                      CSV schema documentation
                    </a>
                    .
                  </p>
                  <p>
                    If you're starting from scratch, use the standard CSV as a
                    template.
                  </p>
                </li>
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">
                    Format your column headers to match the SimpleReport
                    standard CSV
                  </h4>
                  <p>
                    Whether you're modifying an existing file or creating a new
                    one from scratch, be sure to include all column headers
                    outlined in the standard file and documentation. Do not
                    include any additional column headers. Make sure headers are
                    written exactly as defined.
                  </p>
                  <p>
                    Include column headers even if you don’t have data for every
                    field.
                  </p>
                </li>
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">
                    Enter values into your CSV file
                  </h4>
                  <p>
                    Following the{" "}
                    <a href="/getting-started/testing-facilities/csv-schema">
                      {" "}
                      CSV template guide
                    </a>{" "}
                    , enter properly formatted values in the relevant fields.
                  </p>
                </li>
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">Export your CSV</h4>
                  <p>Export your properly formatted CSV with filled-in data.</p>
                  <p>
                    <em>
                      Be sure to save your file as .CSV. SimpleReport CSV upload
                      does not accept files saved as .XLS, .XLXS, or other
                      formats.
                    </em>
                  </p>
                </li>
              </ol>
            </section>
            <section>
              <h3
                id="upload-a-csv"
                className="font-body-lg border-top-1px border-ink margin-top-8 margin-bottom-6 padding-top-1"
              >
                Uploading a CSV file
              </h3>
              <ol className="usa-process-list">
         
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">
                    Navigate to "Upload spreadsheet"
                  </h4>
                  <p className="margin-top-2">
                    You can find "Upload spreadsheet" under "Results" in the
                    main site navigation at the top of the page.
                  </p>
                </li>
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">
                    Select file to upload
                  </h4>
                  <ul className="margin-top-2">
                    <li>
                      <strong>Option A:</strong> Drag your CSV file from your
                      folder to the upload area.
                    </li>
                    <li>
                      <strong>Option B:</strong> Click “choose from folder” to
                      browse your computer, select CSV file and click Open.
                    </li>
                  </ul>
                </li>
                <li className="usa-process-list__item">
                  <h4 className="usa-process-list__heading">Upload the file</h4>
                  <ul className="margin-top-2">
                    <li>Click "Upload."</li>
                    <li>
                      SimpleReport will validate your file and provide
                      confirmation that it has been accepted.
                    </li>
                  </ul>
                  <p>
                    <strong>Optional: Fix any errors</strong>
                  </p>
                  <p>
                    SimpleReport checks all uploaded files against a{" "}
                    <a
                      href="/getting-started/testing-facilities/csv-schema"
                      className="usa-link"
                    >
                      standard CSV schema, or data structure..
                    </a>
                    . If it detects any errors in a file's format or data, the
                    application will alert you to the specific changes you need
                    to make before submitting.
                  </p>
                  <p>To resolve errors in a CSV:</p>
                  <ul>
                    <li>
                      Review the list of errors and recommended changes
                      suggested by SimpleReport. Reference the{" "}
                      <a
                        href="/getting-started/testing-facilities/csv-schema"
                        className="usa-link"
                      >
                        CSV template guide
                      </a>{" "}
                      again for any adjustments you need to make to column
                      headers or values.
                    </li>
                    <li>
                      Make the recommended changes to the file and re-export it
                      as a .CSV
                    </li>
                    <li>Return to step 3 and upload the corrected file</li>
                  </ul>
                </li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadGuide;
