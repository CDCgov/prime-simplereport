import { useParams } from "react-router-dom";
import moment from "moment";
import { DatePicker, Label } from "@trussworks/react-uswds";
import { useState } from "react";

import Pagination from "../../commonComponents/Pagination";
import { formatDateWithTimeOption } from "../../utils/date";
import {
  GetUploadSubmissionsQuery,
  useGetUploadSubmissionsQuery,
} from "../../../generated/graphql";
import { setStartTimeForDateRange } from "../../analytics/Analytics";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../../utils/hooks";

const Submissions = () => {
  useDocumentTitle("View upload history");

  const urlParams = useParams();
  const pageNumber = Number(urlParams.pageNumber) || 1;
  const pageSize = 10;

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [resetCount, setResetCount] = useState<number>(0);

  const { data: submissions, loading, error } = useGetUploadSubmissionsQuery({
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

  const SubmissionsTableRows = (
    submissionsResult: GetUploadSubmissionsQuery | undefined
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
        <tr>
          <td>No results</td>
        </tr>
      );
    }

    return submissionsResult.uploadSubmissions.content.map((submission) => {
      return (
        <tr key={submission.internalId}>
          <td>
            <LinkWithQuery
              to={`/results/upload/submission/${submission.internalId}`}
              className="sr-link__primary"
            >
              {submission.reportId}
            </LinkWithQuery>
          </td>
          <td>{formatDateWithTimeOption(submission.createdAt, true)}</td>
          <td>{submission.recordsCount}</td>
          <td>{submission.status}</td>
        </tr>
      );
    });
  };

  return (
    <div className="grid-row">
      <div className="prime-container card-container">
        {/*Submission header*/}
        <div className="usa-card__header">
          <h2>Upload history</h2>
        </div>

        {/*filters*/}
        <div className="position-relative bg-base-lightest">
          <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
            <div>
              <Label htmlFor="start-date">Submitted (Start Range)</Label>
              <DatePicker
                key={resetCount}
                id="start-date"
                name="start-date"
                defaultValue={startDate || ""}
                data-testid="start-date"
                minDate="2000-01-01T00:00"
                maxDate={moment().format("YYYY-MM-DDThh:mm")}
                onChange={(date?: string) => {
                  if (date && date.length === 10) {
                    const newDate = new Date(date);
                    setStartDate(
                      setStartTimeForDateRange(newDate).toISOString()
                    );
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="end-date">Submitted (End Range)</Label>
              <DatePicker
                key={resetCount}
                id="end-date"
                name="end-date"
                defaultValue={endDate || ""}
                data-testid="end-date"
                minDate="2000-01-01T00:00"
                maxDate={moment().add(1, "day").format("YYYY-MM-DDThh:mm")}
                onChange={(date?: string) => {
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
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>{SubmissionsTableRows(submissions)}</tbody>
          </table>
        </div>

        {/*pagination*/}
        <div className="usa-card__footer">
          <Pagination
            baseRoute="/results/upload/submissions"
            currentPage={pageNumber}
            entriesPerPage={pageSize}
            totalEntries={submissions?.uploadSubmissions.totalElements || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Submissions;
