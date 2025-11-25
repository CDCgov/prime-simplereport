import { useParams } from "react-router-dom";

import iconSprite from "../../../../node_modules/@uswds/uswds/dist/img/sprite.svg";
import { useGetUploadSubmissionQuery } from "../../../generated/graphql";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { formatDateWithTimeOption } from "../../utils/date";
import { useDocumentTitle } from "../../utils/hooks";

const Submission = () => {
  useDocumentTitle("View upload details");
  const urlParams = useParams();
  const internalId = urlParams.id || "";

  const {
    data: submission,
    loading,
    error,
  } = useGetUploadSubmissionQuery({
    fetchPolicy: "no-cache",
    variables: {
      id: internalId,
    },
  });

  if (loading) {
    return <p> Loading... </p>;
  }

  if (error) {
    throw error;
  }

  const transmissionDate = formatDateWithTimeOption(
    submission?.uploadSubmission.createdAt,
    true
  );

  return (
    <div className="grid-row header-size-fix">
      <div className="prime-container card-container">
        {/* Sub-heading */}
        <div className="usa-card__header">
          <div>
            <div className="display-flex flex-align-center">
              <svg
                className="usa-icon text-base margin-left-neg-2px"
                aria-hidden="true"
                focusable="false"
                role="img"
              >
                <use xlinkHref={iconSprite + "#arrow_back"}></use>
              </svg>
              <LinkWithQuery
                to={`/results/upload/submissions/`}
                className="margin-left-05"
              >
                Upload history
              </LinkWithQuery>
            </div>
            <div>
              <h1 className="margin-top-2">Submission details</h1>
            </div>
          </div>
        </div>

        {/* Submission detail */}
        <div className="usa-card__body">
          <div className="display-flex flex-column margin-top-2 margin-bottom-4">
            <span className="text-base">Report ID</span>
            <span>{submission?.uploadSubmission.reportId}</span>
          </div>
          <div className="display-flex flex-column margin-bottom-4">
            <span className="text-base">Data stream</span>
            <span>ELR</span>
          </div>
          <div className="display-flex flex-column margin-bottom-4">
            <span className="text-base">Transmission date</span>
            <span>{transmissionDate}</span>
          </div>
          <div className="display-flex flex-column margin-bottom-2">
            <span className="text-base">Records</span>
            <span>{submission?.uploadSubmission.recordsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submission;
