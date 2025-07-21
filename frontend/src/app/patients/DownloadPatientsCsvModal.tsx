import { useState } from "react";
import Modal from "react-modal";
import {
  faDownload,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../commonComponents/Button/Button";
import { showError } from "../utils/srToast";

interface DownloadPatientsCsvModalProps {
  handleDownloadPatientData: () => void;
  modalIsOpen: boolean;
  closeModal: () => void;
  totalPatientsToDownload?: number;
}

type DownloadState = "idle" | "downloading" | "complete";

const DownloadPatientsCsvModal = ({
  handleDownloadPatientData,
  modalIsOpen,
  closeModal,
  totalPatientsToDownload,
}: DownloadPatientsCsvModalProps) => {
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  const getDownloadMessage = () => {
    const rowText = totalPatientsToDownload?.toLocaleString();
    switch (downloadState) {
      case "downloading":
        if (totalPatientsToDownload && totalPatientsToDownload > 10000) {
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
          label: "Download patients",
          className: "",
        };
    }
  };

  const handleClose = () => {
    if (downloadState !== "downloading") {
      closeModal();
      setDownloadState("idle");
    }
  };

  const handleDownload = () => {
    setDownloadState("downloading");
    try {
      handleDownloadPatientData();
      setDownloadState("complete");

      setTimeout(() => {
        closeModal();
        setDownloadState("idle");
      }, 2000);
    } catch (e: any) {
      console.error("Download error:", e);
      showError("Error downloading patient data", e.message);
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
      contentLabel="Download patient data"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={handleClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            {isComplete ? "Download Complete" : "Download patient data"}
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
              {
                "Download patient data?"
                // isAllFacilitiesSelected
                // ? filtersPresent
                //   ? "Download results for all facilities with current search filters applied?"
                //   : "Download results for all facilities without any search filters applied?"
                // : filtersPresent
                // ? "Download results with current search filters applied?"
                // : "Download results without any search filters applied?"
              }
            </p>
          </div>
        )}
        <div className="grid-row grid-gap">
          <p>{getDownloadMessage()}</p>
        </div>

        {isDownloading &&
          totalPatientsToDownload &&
          totalPatientsToDownload > 1000 && (
            <div className="grid-row grid-gap">
              <p
                className="text-base margin-top-1"
                style={{ fontStyle: "italic" }}
              >
                Large downloads may take several minutes. Please don't close
                this window.
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

export default DownloadPatientsCsvModal;
