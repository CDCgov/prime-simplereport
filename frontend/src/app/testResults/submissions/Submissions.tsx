import { useParams } from "react-router-dom";
import moment from "moment";
import { Label } from "@trussworks/react-uswds";
import { useState } from "react";

import Pagination from "../../commonComponents/Pagination";
import { formatDateWithTimeOption } from "../../utils/date";
import {
  GetUploadSubmissionsQuery,
  useGetUploadSubmissionsQuery,
} from "../../../generated/graphql";
import { useDocumentTitle } from "../../utils/hooks";
import "../HeaderSizeFix.scss";

const getSubmissionsTableRows = (
  submissionsResult: GetUploadSubmissionsQuery | undefined,
  loading: boolean
) => {
  if (loading) {
    return (
      <tr>
        <td>Loading ...</td>
      </tr>
    );
  } else if (
    !submissionsResult ||
    submissionsResult.uploadSubmissions.totalElements === 0
  ) {
    return (
      <tr className="border-bottom">
        <td>No results</td>
      </tr>
    );
  }

  return submissionsResult.uploadSubmissions.content.map((submission) => {
    return (
      <tr key={submission.internalId}>
        <td>{submission.reportId}</td>
        <td>{formatDateWithTimeOption(submission.createdAt, true)}</td>
        <td>{submission.recordsCount}</td>
      </tr>
    );
  });
};

const Submissions = () => {
  useDocumentTitle("View upload history");

  const urlParams = useParams();
  const pageNumber = Number(urlParams.pageNumber) || 1;
  const pageSize = 10;

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [resetCount, setResetCount] = useState<number>(0);

  const {
    data: submissions,
    loading,
    error,
  } = useGetUploadSubmissionsQuery({
    fetchPolicy: "no-cache",
    variables: {
      pageSize,
      pageNumber: pageNumber - 1,
      startDate,
      endDate,
    },
  });

  if (error) {
    throw error;
  }

  return (
    <div className="grid-row header-size-fix">
      <div className="prime-container card-container">
        {/*Submission header*/}
        <div className="usa-card__header">
          <h1>Upload history</h1>
        </div>

        {/*filters*/}
        <div className="position-relative bg-base-lightest">
          <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
            <div>
              <Label htmlFor="start-date">Date range (start)</Label>
              <input
                key={resetCount}
                id="start-date"
                data-testid="start-date"
                type="date"
                className="usa-input width-card"
                defaultValue={startDate || ""}
                min="2000-01-01"
                max={moment().format("YYYY-MM-DD")}
                aria-label="Start Date"
                onChange={(e) => {
                  const date = e.target.value;
                  if (date && date.length === 10) {
                    const newDate = new Date(date);
                    setStartDate(newDate.toISOString());
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="end-date">Date range (end)</Label>
              <input
                key={resetCount}
                id="end-date"
                data-testid="end-date"
                type="date"
                className="usa-input width-card"
                defaultValue={endDate || ""}
                min="2000-01-01"
                max={moment().add(1, "day").format("YYYY-MM-DD")}
                aria-label="End Date"
                onChange={(e) => {
                  const date = e.target.value;
                  if (date && date.length === 10) {
                    const newDate = new Date(date);
                    setEndDate(newDate.toISOString());
                  }
                }}
              />
            </div>

            <button
              className="usa-button usa-button--outline"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setResetCount(resetCount + 1);
              }}
            >
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
              </tr>
            </thead>
            <tbody>{getSubmissionsTableRows(submissions, loading)}</tbody>
          </table>
        </div>

        {/*pagination*/}
        {submissions !== undefined &&
          submissions.uploadSubmissions.totalElements > 0 && (
            <div className="usa-card__footer">
              <Pagination
                baseRoute="/results/upload/submissions"
                currentPage={pageNumber}
                entriesPerPage={pageSize}
                totalEntries={submissions?.uploadSubmissions.totalElements || 0}
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default Submissions;
