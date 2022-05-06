import { useParams } from "react-router-dom";
import moment from "moment";

import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { gql, useQuery } from "@apollo/client";
import { UploadStatus, UploadSubmission } from "../../../generated/graphql";
import { useSelector } from "react-redux";

const Submission = () => {
  const urlParams = useParams();
  const reportId = urlParams.id;

  /*
  const GET_SUBMISSION = gql`
    query GetSubmissionUpload($id: String!) {
      uploadSubmission(id: $id) {
        internalId
        reportId
        createdAt
        status
        recordsCount
      }
    }
  `;
*/

const submission: UploadSubmission = {
  reportId: "foobar",
  internalId: "barfoo",
  status: UploadStatus.Success,
  recordsCount: "2",
  createdAt: Date.now(),
}
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );

  /*
  const { data: submission, loading, error } = useQuery<UploadSubmission>(GET_SUBMISSION, {
    fetchPolicy: "no-cache",
    variables: {
      id: reportId
    }
  });

  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    throw error;
  }
  */

  const transmissionTimestamp = moment(submission?.createdAt);
  const transmissionDate = transmissionTimestamp.format("dd Mon YYYY");
  const transmissionTime = transmissionTimestamp.format("hh:mm:ss a");

  return (
    <main className="prime-home">
      <div className="grid-container results-wide-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            {/*Submission header*/}
            <div className="usa-card__header">
              <h2>COVID-19 Submissions</h2>
            </div>

            {/*submissions table*/}
            <div className="usa-card__body" title="filtered-result">
              <table className="usa-table usa-table--borderless width-full">
                <thead>{moment(submission?.createdAt).format("DD MMM YYYY k:mm")}
                </thead>
                <tbody>
                  <tr>
                    <th>Report ID</th>
                    <td>{submission?.reportId}</td>
                  </tr>
                  <tr>{organization.name}</tr>
                  <tr>
                    <th>Transmission Date</th>
                    <td>{transmissionDate}</td>
                  </tr>
                  <tr>
                    <th>Transmission Time</th>
                    <td>{transmissionTime}</td>
                  </tr>
                  <tr>
                    <th>Records</th>
                    <td>{submission?.recordsCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Submission;