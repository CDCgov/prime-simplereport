import React, { useState } from "react";
import Modal from "react-modal";

import Button from "./Button/Button";

const DATA_RETENTION_MODAL_DISMISSED_KEY = "dataRetentionModalDismissed";
const SUPPORT_LINK =
  "https://www.simplereport.gov/using-simplereport/data-retention-limits/";

interface DataRetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataRetentionModal = ({ isOpen, onClose }: DataRetentionModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem(DATA_RETENTION_MODAL_DISMISSED_KEY, "true");
    }
    onClose();
  };

  const handleLearnMoreClick = () => {
    window.open(SUPPORT_LINK, "_blank", "noopener,noreferrer");
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDontShowAgain(event.target.checked);
  };

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      className="sr-data-retention-modal-content"
      overlayClassName="sr-data-retention-modal-overlay"
      contentLabel="Data retention notification"
      aria-labelledby="data-retention-title"
      aria-describedby="data-retention-description"
    >
      <div className="border-0 card-container">
        <h2
          id="data-retention-title"
          className="font-heading-lg margin-top-05 margin-bottom-2"
        >
          New data retention limits are coming to SimpleReport
        </h2>

        <div id="data-retention-description" className="margin-bottom-3">
          <p className="usa-prose">
            Beginning November 1st, SimpleReport will only store patient
            profiles and test results for 30 days. This change may impact how
            your facility or organization uses SimpleReport.
          </p>
          <p className="usa-prose">
            Learn more about data retention limits and our recommendations for
            managing your workflow.
          </p>
        </div>

        <div className="margin-bottom-3">
          <label className="usa-checkbox">
            <input
              className="usa-checkbox__input"
              id="dont-show-again"
              type="checkbox"
              name="dont-show-again"
              checked={dontShowAgain}
              onChange={handleCheckboxChange}
            />
            <span className="usa-checkbox__label">
              Got it. I don't need to see this again.
            </span>
          </label>
        </div>

        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-2 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={handleLearnMoreClick}
              variant="outline"
              label="Learn more"
            />
            <Button onClick={handleContinue} label="Continue to SimpleReport" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DataRetentionModal;

export const shouldShowDataRetentionModal = (): boolean => {
  const dismissed = localStorage.getItem(DATA_RETENTION_MODAL_DISMISSED_KEY);
  return !dismissed;
};
