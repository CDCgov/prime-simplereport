import moment from "moment";
import { useSelector } from "react-redux";

import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { useGetUploadSubmissionQuery } from "../../../generated/graphql";

type SubmissionProps = {
  reportId: string;
};

const Submission = (submissionProps: SubmissionProps) => {
  const reportId = submissionProps.reportId;

  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );

  const { data: submission, loading, error } = useGetUploadSubmissionQuery({
    fetchPolicy: "no-cache",
    variables: {
      id: reportId,
    },
  });

  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    throw error;
  }

  const transmissionTimestamp = moment(submission?.uploadSubmission.createdAt);
  const transmissionDate = transmissionTimestamp.format("DD MMM YYYY");
  const transmissionTime = transmissionTimestamp.format("k:mm");

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            {/* Sub-heading */}
            <div className="usa-card__body text-normal font-body-xs text-base margin-bottom-0">
              <span>
                <a href="/results/upload/submission">
                  {organization.name} COVID-19 Submissions
                </a>
              </span>
            </div>

            {/* Submission result header */}
            <div className="usa-card__body">
              <h1>{[transmissionDate, transmissionTime].join(" ")}</h1>
            </div>

            {/* Submission detail */}
            <div className="usa-card__body">
              <div className="display-flex flex-column margin-top-2 margin-bottom-2">
                <span className="text-base">Report ID</span>
                <td>{submission?.uploadSubmission.reportId}</td>
              </div>
              <div className="display-flex flex-column"></div>
              <h2>{organization.name}</h2>
              <div className="display-flex flex-column margin-bottom-4">
                <span className="text-base">Data Stream</span>
                <span>ELR</span>
              </div>
              <div className="display-flex flex-column margin-bottom-4">
                <span className="text-base">Transmission Date</span>
                <span>{transmissionDate}</span>
              </div>

              <div className="display-flex flex-column margin-bottom-4">
                <span className="text-base">Transmission Time</span>
                <span>{transmissionTime}</span>
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
