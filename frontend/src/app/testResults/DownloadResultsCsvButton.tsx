import { useRef, useState } from "react";
import Modal from "react-modal";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSVLink } from "react-csv";
import { useFeature } from "flagged";

import { showError } from "../utils";
import { useImperativeQuery } from "../utils/hooks";
import { parseDataForCSV } from "../utils/testResultCSV";
import Button from "../commonComponents/Button/Button";
import { GetFacilityResultsForCsvDocument } from "../../generated/graphql";

import {
  ALL_FACILITIES_ID,
  FilterParams,
  ResultsQueryVariables,
} from "./TestResultsList";

interface Props {
  filterParams: FilterParams;
  totalEntries: number;
  activeFacilityId: string;
}

const DownloadResultsCSVButton = ({
  filterParams,
  totalEntries,
  activeFacilityId,
}: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const csvLink = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);

  const multiplexEnabled = useFeature("multiplexEnabled") as boolean;

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const filtersPresent =
    filterParams.patientId ||
    filterParams.startDate ||
    filterParams.endDate ||
    filterParams.role ||
    filterParams.result ||
    (filterParams.filterFacilityId &&
      filterParams.filterFacilityId !== activeFacilityId);

  const variables: ResultsQueryVariables = {
    facilityId:
      filterParams.filterFacilityId === ALL_FACILITIES_ID
        ? null
        : filterParams.filterFacilityId || activeFacilityId,
    pageNumber: 0,
    pageSize: totalEntries,
    ...filterParams,
  };

  const getResults = useImperativeQuery(GetFacilityResultsForCsvDocument, {
    fetchPolicy: "no-cache",
  });

  const downloadResults = async () => {
    setLoading(true);
    const { data, error } = await getResults(variables);
    if (error) {
      showError("Error downloading results", error.message);
      setLoading(false);
    } else {
      const results = parseDataForCSV(data.testResults, multiplexEnabled);
      setResults(results);
      setLoading(false);
      csvLink?.current?.link.click();
      closeModal();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        icon={faDownload}
        label="Download results"
        onClick={openModal}
      />
      <Modal
        isOpen={modalIsOpen}
        style={{
          content: {
            maxHeight: "90vh",
            width: "40em",
            position: "initial",
          },
        }}
        overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
        contentLabel="Download test results"
        ariaHideApp={process.env.NODE_ENV !== "test"}
      >
        <div className="border-0 card-container">
          <div className="display-flex flex-justify">
            <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
              Download test results
            </h1>
            <button
              onClick={closeModal}
              className="close-button"
              aria-label="Close"
            >
              <span className="fa-layers">
                <FontAwesomeIcon icon={"circle"} size="2x" inverse />
                <FontAwesomeIcon icon={"times-circle"} size="2x" />
              </span>
            </button>
          </div>
          <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
          <div className="grid-row grid-gap">
            {filtersPresent ? (
              <p>Download results with current search filters applied?</p>
            ) : (
              <p>Download results without any search filters applied?</p>
            )}
          </div>
          <div className="grid-row grid-gap">
            <p>The CSV file will include {totalEntries} rows.</p>
          </div>
          <div className="border-top border-base-lighter margin-x-neg-205 margin-top-2 padding-top-205 text-right">
            <div className="display-flex flex-justify-end">
              <Button
                className="margin-right-2"
                onClick={closeModal}
                variant="unstyled"
                label="No, go back"
              />
              <Button
                onClick={downloadResults}
                icon={faDownload}
                label={loading ? "Loading..." : "Download results"}
              />
              <CSVLink
                data={results}
                filename="simplereport-test-results.csv"
                className="hidden"
                ref={csvLink}
                target="_blank"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DownloadResultsCSVButton;
