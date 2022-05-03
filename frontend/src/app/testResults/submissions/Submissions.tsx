import React from "react";

import "./Submissions.scss";
import moment from "moment";
import { DatePicker, Label } from "@trussworks/react-uswds";

import Pagination from "../../commonComponents/Pagination";
import { formatDateWithTimeOption } from "../../utils/date";

function Submissions() {
  const loading = false;

  const SubmissionsTableRows = (submissions: any) => {
    if (submissions.length === 0) {
      return (
        <tr>
          <td>No results</td>
        </tr>
      );
    }

    // `sort` mutates the array, so make a copy
    return [...submissions].map((r) => {
      return (
        <tr>
          <td className="test-result-cell">
            d35ac97b-ad02-4e74-a3ff-7cc7704128d5
          </td>
          <td className="test-date-cell">
            {formatDateWithTimeOption(new Date(), true)}
          </td>
          <td className="test-result-cell"></td>
          <td className="test-result-cell">2</td>
          <td className="test-result-cell">Success</td>
        </tr>
      );
    });
  };

  return (
    <main className="prime-home">
      <div className="grid-container results-wide-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-test-results-list">
            {/*Submission header*/}
            <div className="usa-card__header">
              <h2>
                COVID-19 Submissions
                {
                  <span className="sr-showing-results-on-page">
                    All-In-One Health CSV lab report schema, California
                  </span>
                }
              </h2>
            </div>

            {/*filters*/}
            <div
              id="test-results-search-by-patient-input"
              className="position-relative bg-base-lightest"
            >
              <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
                <div className="usa-form-group date-filter-group">
                  <Label htmlFor="start-date">Submitted (Start Range)</Label>
                  <DatePicker
                    id="start-date"
                    name="start-date"
                    defaultValue={""}
                    data-testid="start-date"
                    minDate="2000-01-01T00:00"
                    maxDate={moment().format("YYYY-MM-DDThh:mm")}
                  />
                </div>

                <div className="usa-form-group date-filter-group">
                  <Label htmlFor="start-date">Submitted (End Range)</Label>
                  <DatePicker
                    id="start-date"
                    name="start-date"
                    defaultValue={""}
                    data-testid="start-date"
                    minDate="2000-01-01T00:00"
                    maxDate={moment().format("YYYY-MM-DDThh:mm")}
                  />
                </div>

                <button className="usa-button">Filter</button>
                <button className="usa-button usa-button--outline">
                  Clear
                </button>
              </div>
            </div>

            {/*submissions table*/}
            <div className="usa-card__body" title="filtered-result">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col" className="patient-name-cell">
                      Report ID
                    </th>
                    <th scope="col" className="test-date-cell">
                      Date/Time submitted
                    </th>
                    <th scope="col" className="test-result-cell">
                      File
                    </th>
                    <th scope="col" className="test-facility-cell">
                      Records
                    </th>
                    <th scope="col" className="test-device-cell">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>{SubmissionsTableRows([{}])}</tbody>
              </table>
            </div>

            {/*pagination*/}
            <div className="usa-card__footer">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Pagination
                  baseRoute="/results"
                  currentPage={1}
                  entriesPerPage={20}
                  totalEntries={100}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Submissions;
