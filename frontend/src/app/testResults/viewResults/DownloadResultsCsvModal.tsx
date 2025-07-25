import { useState } from "react";
import Modal from "react-modal";
import {
  faDownload,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { showError } from "../../utils/srToast";
import Button from "../../commonComponents/Button/Button";
import FetchClient from "../../../app/utils/api";
import { getAppInsightsHeaders } from "../../TelemetryService";
import { triggerBlobDownload } from "../../utils/file";

import { ALL_FACILITIES_ID } from "./TestResultsList";

interface DownloadResultsCsvModalProps {
  filterParams: FilterParams;
  modalIsOpen: boolean;
  closeModal: () => void;
  totalEntries: number;
  activeFacilityId: string;
}

type DownloadState = "idle" | "downloading" | "complete";
const apiClient = new FetchClient();

function buildCsvDownloadPath({
  filterParams,
  activeFacilityId,
}: {
  filterParams: FilterParams;
  activeFacilityId: string;
}) {
  const basePath = `/results/download`;
  const params = new URLSearchParams();

  if (filterParams.filterFacilityId === ALL_FACILITIES_ID) {
    // Organization-level download (facilityId is null)
    // No facilityId parameter- backend will treat as org export
  } else {
    // Facility-level download
    const facilityId = filterParams.filterFacilityId ?? activeFacilityId;
    params.append("facilityId", facilityId);
  }

  if (filterParams.patientId)
    params.append("patientId", filterParams.patientId);
  if (filterParams.result) params.append("result", filterParams.result);
  if (filterParams.role) params.append("role", filterParams.role);
  if (filterParams.disease) params.append("disease", filterParams.disease);
  if (filterParams.startDate)
    params.append("startDate", filterParams.startDate);
  if (filterParams.endDate) params.append("endDate", filterParams.endDate);

  return `${basePath}?${params.toString()}`;
}

const DownloadResultsCsvModal = ({
  filterParams,
  modalIsOpen,
  closeModal,
  totalEntries,
  activeFacilityId,
}: DownloadResultsCsvModalProps) => {
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const isAllFacilitiesSelected =
    filterParams.filterFacilityId === ALL_FACILITIES_ID;
  const filtersPresent = Object.entries(filterParams).some(([key, val]) => {
    if (key === "filterFacilityId") {
      return val !== activeFacilityId;
    }
    return val;
  });

  const getDownloadMessage = () => {
    const rowText = totalEntries.toLocaleString();
    switch (downloadState) {
      case "downloading":
        if (totalEntries > 10000) {
          return `Downloading ${rowText}... This may take a moment for large files.`;
        }
        return `Downloading ${rowText}...`;
      case "complete":
        return `Download complete! ${rowText} downloaded successfully.`;
      default:
        return `The CSV file will include ${rowText} rows.`;
    }
  };

  const getButtonContent = () => {
    switch (downloadState) {
      case "downloading":
        return {
          icon: faSpinner,
          label: "Downloading...",
          className: "fa-spin",
        };
      case "complete":
        return {
          icon: faCheck,
          label: "Download complete",
          className: "",
        };
      default:
        return {
          icon: faDownload,
          label: "Download results",
          className: "",
        };
    }
  };

  const handleDownload = async () => {
    setDownloadState("downloading");
    try {
      const downloadPath = buildCsvDownloadPath({
        filterParams,
        activeFacilityId,
      });
      const fullUrl = apiClient.getURL(downloadPath);

      console.log("Download URL:", fullUrl);
      setDownloadState("downloading");

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

      triggerBlobDownload({
        blob,
        contentDisposition: contentDisposition || undefined,
        defaultFilename: "simplereport-test-results.zip",
      });

      setDownloadState("complete");

      setTimeout(() => {
        closeModal();
        setDownloadState("idle");
      }, 2000);
    } catch (e: any) {
      console.error("Download error:", e);
      showError("Error downloading results", e.message);
      setDownloadState("idle");
    }
  };
  const handleClose = () => {
    if (downloadState !== "downloading") {
      closeModal();
      setDownloadState("idle");
    }
  };

  const buttonContent = getButtonContent();
  const isDownloading = downloadState === "downloading";
  const isComplete = downloadState === "complete";

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
      onRequestClose={handleClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            {isComplete ? "Download Complete" : "Download test results"}
          </h1>
          <button
            onClick={handleClose}
            className="close-button"
            aria-label="Close"
            disabled={isDownloading}
            style={{ opacity: isDownloading ? 0.5 : 1 }}
          >
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>

        {!isComplete && (
          <div className="grid-row grid-gap">
            <p>
              {isAllFacilitiesSelected
                ? filtersPresent
                  ? "Download results for all facilities with current search filters applied?"
                  : "Download results for all facilities without any search filters applied?"
                : filtersPresent
                ? "Download results with current search filters applied?"
                : "Download results without any search filters applied?"}
            </p>
          </div>
        )}
        <div className="grid-row grid-gap">
          <p>{getDownloadMessage()}</p>
        </div>

        {isDownloading && totalEntries > 1000 && (
          <div className="grid-row grid-gap">
            <p
              className="text-base margin-top-1"
              style={{ fontStyle: "italic" }}
            >
              Large downloads may take several minutes. Please don't close this
              window.
            </p>
          </div>
        )}

        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-2 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            {!isComplete && (
              <Button
                className="margin-right-2"
                onClick={handleClose}
                variant="unstyled"
                label={"No, go back"}
                disabled={isDownloading}
              />
            )}
            <Button
              onClick={isComplete ? handleClose : handleDownload}
              disabled={isDownloading}
              icon={buttonContent.icon}
              iconClassName={buttonContent.className}
              label={buttonContent.label}
              variant={isComplete ? "accent-cool" : undefined}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadResultsCsvModal;
