import { useState } from "react";
import Modal from "react-modal";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { showError } from "../../utils/srToast";
import Button from "../../commonComponents/Button/Button";
import FetchClient from "../../../app/utils/api"; // Adjust the import path to your FetchClient
import { getAppInsightsHeaders } from "../../TelemetryService"; // Adjust import path

import { ALL_FACILITIES_ID } from "./TestResultsList";

interface DownloadResultsCsvModalProps {
  filterParams: FilterParams;
  modalIsOpen: boolean;
  closeModal: () => void;
  totalEntries: number;
  activeFacilityId: string;
}

// Create an instance of FetchClient for API calls
const apiClient = new FetchClient();

function buildCsvDownloadPath({
  filterParams,
  activeFacilityId,
}: {
  filterParams: FilterParams;
  activeFacilityId: string;
}) {
  const facilityId =
    filterParams.filterFacilityId === ALL_FACILITIES_ID
      ? activeFacilityId
      : filterParams.filterFacilityId ?? activeFacilityId;

  const basePath = `/facilities/${facilityId}/results/download`;

  const params = new URLSearchParams();
  if (filterParams.patientId)
    params.append("patientId", filterParams.patientId);
  if (filterParams.result) params.append("result", filterParams.result);
  if (filterParams.role) params.append("role", filterParams.role);
  if (filterParams.disease) params.append("disease", filterParams.disease);
  if (filterParams.startDate)
    params.append("startDate", filterParams.startDate);
  if (filterParams.endDate) params.append("endDate", filterParams.endDate);

  return params.toString() ? `${basePath}?${params.toString()}` : basePath;
}

export const DownloadResultsCsvModal = ({
  filterParams,
  modalIsOpen,
  closeModal,
  totalEntries,
  activeFacilityId,
}: DownloadResultsCsvModalProps) => {
  const [downloading, setDownloading] = useState(false);
  const filtersPresent = Object.entries(filterParams).some(([key, val]) => {
    // active facility in the facility filter is the default
    if (key === "filterFacilityId") {
      return val !== activeFacilityId;
    }
    return val;
  });

  const pluralizeRows = (entriesCount: number) => {
    return entriesCount > 1 ? "s" : "";
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const downloadPath = buildCsvDownloadPath({
        filterParams,
        activeFacilityId,
      });
      const fullUrl = apiClient.getURL(downloadPath);

      console.log("Download URL:", fullUrl); // Debug logging

      const response = await fetch(fullUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          "Access-Control-Request-Headers": "Authorization",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          ...getAppInsightsHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download CSV: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "simplereport-test-results.csv";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }

      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      closeModal();
    } catch (e: any) {
      console.error("Download error:", e); // Debug logging
      showError("Error downloading results", e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
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
      onRequestClose={closeModal}
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
          <p>
            {filtersPresent
              ? "Download results with current search filters applied?"
              : "Download results without any search filters applied?"}
          </p>
        </div>
        <div className="grid-row grid-gap">
          <p>
            The CSV file will include {totalEntries} row
            {pluralizeRows(totalEntries)}.
          </p>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-2 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={closeModal}
              variant="unstyled"
              label={"No, go back"}
            />
            <Button
              onClick={handleDownload}
              disabled={downloading}
              icon={faDownload}
              label={downloading ? "Loading..." : "Download results"}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadResultsCsvModal;
