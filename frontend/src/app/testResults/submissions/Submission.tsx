import { useParams } from "react-router-dom";

import { useGetUploadSubmissionQuery } from "../../../generated/graphql";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { formatDateWithTimeOption } from "../../utils/date";

const Submission = () => {
  const urlParams = useParams();
  const internalId = urlParams.id || "";

  const { data: submission, loading, error } = useGetUploadSubmissionQuery({
    fetchPolicy: "no-cache",
    variables: {
      id: internalId,
    },
  });

  if (loading) {
    return (
      <main className="prime-home">
        <div className="grid-container">
          <p> Loading... </p>
        </div>
      </main>
    );
  }

  if (error) {
    throw error;
  }

  const transmissionDate = formatDateWithTimeOption(
    submission?.uploadSubmission.createdAt,
    true
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            {/* Sub-heading */}
            <div className="usa-card__body text-normal font-body-xs text-base margin-bottom-0">
              <span>
                <LinkWithQuery
                  to={`/results/upload/submissions/`}
                  className="sr-link__primary"
                >
                  Return to spreadsheet upload history
                </LinkWithQuery>
              </span>
            </div>

            {/* Submission detail */}
            <div className="usa-card__body">
              <div className="display-flex flex-column margin-top-2 margin-bottom-4">
                <span className="text-base">Report ID</span>
                <td>{submission?.uploadSubmission.reportId}</td>
              </div>
              <div className="display-flex flex-column margin-bottom-4">
                <span className="text-base">Data stream</span>
                <span>ELR</span>
              </div>
              <div className="display-flex flex-column margin-bottom-4">
                <span className="text-base">Transmission date</span>
                <span>{transmissionDate}</span>
              </div>
              <div className="display-flex flex-column margin-bottom-4">
                <span className="text-base">Records</span>
                <span>{submission?.uploadSubmission.recordsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Submission;
