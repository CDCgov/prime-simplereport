import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";
import { OrganizationTypeEnum } from "../../signUp/Organization/utils";

import { ManageFacilityState } from "./ManageFacility";

type FacilityDataItemProps = {
  title: string;
  description: string;
};

const FacilityDataItem: React.FC<FacilityDataItemProps> = ({
  title,
  description,
}) => (
  <div className="margin-y-3">
    <h4 className="margin-y-1">{title}</h4>
    <p className="margin-y-1">{description}</p>
  </div>
);

export interface FacilityInformationProps {
  onFacilityDelete: () => void;
  manageFacilityState: ManageFacilityState;
}

const FacilityInformation: React.FC<FacilityInformationProps> = ({
  manageFacilityState,
  onFacilityDelete,
}) => {
  const OrgTypeDictionary = OrganizationTypeEnum as any;
  const usersCount = manageFacilityState.facility?.usersCount;
  const patientsCount = manageFacilityState.facility?.patientsCount;

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
        styleClassNames={"font-sans-lg margin-top-0 margin-bottom-205"}
      >
        Delete {manageFacilityState.facility?.name}
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <p className="margin-top-4">
        Deleting {manageFacilityState.facility?.name} will remove any
        in-progress tests from the test queue. Users only added to this facility
        will lose access to SimpleReport until an organization admin reassigns
        them. Patients only added to this facility also need to be reassigned.
      </p>
      <p className="margin-top-3">
        {usersCount === 1 ? "There is " : "There are "}
        <strong>
          {usersCount}
          {usersCount === 1 ? " user" : " users"}
        </strong>{" "}
        and{" "}
        <strong>
          {patientsCount}
          {patientsCount === 1 ? " patient" : " patients"}
        </strong>{" "}
        added only to this facility.
      </p>
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
            <h2 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 font-heading-lg margin-top-0 margin-bottom-0">
              {manageFacilityState.facility.name}
            </h2>
          </div>
          <div className="usa-card__body">
            <h3 className="margin-y-3">Facility information</h3>
            <FacilityDataItem
              title="Facility name"
              description={manageFacilityState.facility.name}
            />
            <FacilityDataItem
              title="Location"
              description={`${
                manageFacilityState.facility.city !== ""
                  ? manageFacilityState.facility.city?.concat(", ")
                  : ""
              }${manageFacilityState.facility.state} ${
                manageFacilityState.facility.zipcode
              }`}
            />
            <FacilityDataItem
              title="Organization"
              description={manageFacilityState.facility.org}
            />
            <FacilityDataItem
              title="Organization type"
              description={
                OrgTypeDictionary[manageFacilityState.facility.orgType]
              }
            />
            <h3 className="margin-top-6">Facility controls</h3>
            <div className="margin-y-3">
              <h4 className="margin-y-1">Delete facility</h4>
              <div className="grid-row width-full flex-justify">
                <p className=" desktop:grid-col-8 tablet:grid-col-8 mobile:grid-col-12  margin-y-1 text-italic text-base-darker line-height-sans-3">
                  Any in-progress tests from this facility will be removed, and
                  an organization admin will need to reassign users and patients
                  only added to this facility.
                </p>
                <div className="desktop:grid-col-auto tablet:grid-col-auto mobile:grid-col-12 flex-align-end">
                  <Button
                    variant={"outline"}
                    onClick={() => setShowModal(true)}
                    ariaLabel={`Delete facility ${manageFacilityState.facility.name}`}
                  >
                    Delete facility
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className={"usa-card__body padding-y-3"}>No facility selected. </p>
      )}
      {confirmationModal}
    </div>
  );
};

export default FacilityInformation;
