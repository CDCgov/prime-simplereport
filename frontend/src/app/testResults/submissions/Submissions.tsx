import "./Submissions.scss";

import { useParams } from "react-router-dom";
import moment from "moment";
import { DatePicker, Label } from "@trussworks/react-uswds";

import Pagination from "../../commonComponents/Pagination";
import { formatDateWithTimeOption } from "../../utils/date";
import {
  GetUploadSubmissionsQuery,
  useGetUploadSubmissionsCountQuery,
  useGetUploadSubmissionsQuery,
} from "../../../generated/graphql";

const Submissions = () => {
  const urlParams = useParams();
  const pageNumber = Number(urlParams.pageNumber) || 1;
  const pageSize = 20;

  const {
    data: submissionsCount,
    loading: loadingCount,
  } = useGetUploadSubmissionsCountQuery({ fetchPolicy: "no-cache" });

  const {
    data: submissions,
    loading: loadingSubmissions,
  } = useGetUploadSubmissionsQuery({
    fetchPolicy: "no-cache",
    variables: {
      pageSize,
      pageNumber,
    },
  });

  const loading = loadingCount || loadingSubmissions;

  const SubmissionsTableRows = (
    submissions: GetUploadSubmissionsQuery | undefined
  ) => {
    if (!submissions || submissions.uploadSubmissions.length === 0) {
      return (
        <tr>
          <td>No results</td>
        </tr>
      );
    }

    // `sort` mutates the array, so make a copy
    return [...submissions.uploadSubmissions].map((submission) => {
      return (
        <tr>
          <td>{submission.reportId}</td>
          <td>{formatDateWithTimeOption(submission.createdAt, true)}</td>
          <td>{submission.recordsCount}</td>
          <td>{submission.status}</td>
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
                    <th scope="col">Report ID</th>
                    <th scope="col">Date/Time submitted</th>
                    <th scope="col">Records</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>{SubmissionsTableRows(submissions)}</tbody>
              </table>
            </div>

            {/*pagination*/}
            <div className="usa-card__footer">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Pagination
                  baseRoute="/results/upload/submissions"
                  currentPage={pageNumber}
                  entriesPerPage={pageSize}
                  totalEntries={submissionsCount?.uploadSubmissionsCount || 0}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Submissions;
