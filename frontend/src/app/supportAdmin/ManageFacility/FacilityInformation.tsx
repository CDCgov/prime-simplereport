import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";

import { ManageFacilityState } from "./ManageFacility";

export interface FacilityInformationProps {
  onFacilityDelete: () => void;
  manageFacilityState: ManageFacilityState;
}
const FacilityInformation: React.FC<FacilityInformationProps> = ({
  manageFacilityState,
  onFacilityDelete,
}) => {
  /**
   * Confirmation modal
   */
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);

  const handleConfirmDeletion = () => {
    onFacilityDelete();
    closeModal();
  };

  const confirmationModal = (
    <Modal
      onClose={closeModal}
      title="Delete facility"
      contentLabel="Confirm delete facility"
      showModal={showModal}
    >
      <Modal.Header
        styleClassNames={"font-heading-lg margin-top-0 margin-bottom-205"}
      >
        Delete facility
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <p>
        Are you sure you want to delete facility{" "}
        <strong>{manageFacilityState.facility?.name}</strong>?
      </p>
      <p>[ warning text placeholder ]</p>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-205"
          variant="unstyled"
          label="No, go back"
          onClick={closeModal}
        />
        <Button
          className="margin-right-0"
          label="Yes, delete facility"
          onClick={handleConfirmDeletion}
        />
      </Modal.Footer>
    </Modal>
  );

  /**
   * HTML
   */
  return (
    <div className="prime-container card-container" aria-live={"polite"}>
      {manageFacilityState.facility ? (
        <>
          <div className="usa-card__header">
            <div className="grid-row width-full">
              <h2 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 font-heading-lg margin-top-0 margin-bottom-0">
                {manageFacilityState.facility.name}
              </h2>
              <div className="desktop:grid-col-auto tablet:grid-col-auto mobile:grid-col-12">
                <Button
                  onClick={() => setShowModal(true)}
                  ariaLabel={`Delete facility ${manageFacilityState.facility.name}`}
                >
                  Delete facility
                </Button>
              </div>
            </div>
          </div>
          <div className="usa-card__body">
            <h3 className="margin-y-3">Facility information</h3>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Facility name</h4>
              <p className="margin-y-1">{manageFacilityState.facility.name}</p>
            </div>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Location</h4>
              <p className="margin-y-1">
                {manageFacilityState.facility.city?.concat(", ")}
                {manageFacilityState.facility.state}{" "}
                {manageFacilityState.facility.zipcode}
              </p>
            </div>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Organization</h4>
              <p className="margin-y-1">{manageFacilityState.facility.org}</p>
            </div>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Organization type</h4>
              <p className="margin-y-1">
                {manageFacilityState.facility.orgType}
              </p>
            </div>
            <h3 className="margin-top-6">Users &amp; patients information</h3>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Number of users</h4>
              <p className="margin-y-1">
                4 users (with 1 assigned only to this facility)
              </p>
            </div>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Number of patients</h4>
              <p className="margin-y-1">
                4 patients (with 1 assigned only to this facility)
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className={"usa-card__body padding-y-3"}>No facility selected</p>
      )}
      {confirmationModal}
    </div>
  );
};

export default FacilityInformation;
