import React, { useRef, useState } from "react";
import {
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalRef,
  ModalToggleButton,
} from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import Button from "../../commonComponents/Button/Button";
import { removeTimer, TestTimerWidget, useTestTimer } from "../TestTimer";
import { RootState } from "../../store";
import "./TestCard.scss";

import TestCardForm from "../TestCardForm/TestCardForm";
import { useTestOrderPatient } from "../TestCardForm/TestCardForm.utils";

export interface TestCardProps {
  testOrder: QueriedTestOrder;
  facility: QueriedFacility;
  devicesMap: DevicesMap;
  refetchQueue: () => void;
  removePatientFromQueue: (patientId: string) => Promise<void>;
  startTestPatientId: string | null;
  setStartTestPatientId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TestCard = ({
  testOrder,
  facility,
  devicesMap,
  refetchQueue,
  removePatientFromQueue,
  startTestPatientId,
  setStartTestPatientId,
}: TestCardProps) => {
  const navigate = useNavigate();
  const timer = useTestTimer(
    testOrder.internalId,
    testOrder.deviceType.testLength
  );
  const organization = useSelector<RootState, Organization>(
    (state: any) => state.organization as Organization
  );
  const closeModalRef = useRef<ModalRef>(null);

  const [isOpen, setIsOpen] = useState(true);

  const timerContext = {
    organizationName: organization.name,
    facilityName: facility!.name,
    patientId: testOrder.patient.internalId,
    testOrderId: testOrder.internalId,
  };

  const { patientFullName, patientDateOfBirth } =
    useTestOrderPatient(testOrder);

  const toggleOpen = () => setIsOpen((prevState) => !prevState);

  const removeTestFromQueue = async () => {
    await removePatientFromQueue(testOrder.patient.internalId);
    removeTimer(testOrder.internalId);
  };

  return (
    <>
      <Modal
        ref={closeModalRef}
        aria-labelledby={"close-modal-heading"}
        id="close-modal"
      >
        <ModalHeading id="close-modal-heading">
          Are you sure you want to stop {patientFullName}'s test?
        </ModalHeading>
        <p>
          Doing so will remove this person from the list. You can use the search
          bar to start their test again later.
        </p>
        <ModalFooter id={"close-modal-footer"}>
          <ButtonGroup>
            <ModalToggleButton
              modalRef={closeModalRef}
              closer
              className={"margin-right-1"}
              onClick={removeTestFromQueue}
            >
              Yes, I'm sure.
            </ModalToggleButton>
            <ModalToggleButton modalRef={closeModalRef} unstyled closer>
              No, go back.
            </ModalToggleButton>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
      <Card className={"list-style-none margin-bottom-1em test-card-container"}>
        <CardHeader
          className={`padding-2 ${
            isOpen ? "test-card-header-bottom-border" : ""
          }`}
        >
          <div className="grid-row grid-gap flex-align-center">
            <div className="grid-col-auto margin-top-05">
              <Button variant="unstyled" onClick={toggleOpen}>
                {isOpen ? (
                  <Icon.ExpandLess size={3} focusable={true} />
                ) : (
                  <Icon.ExpandMore size={3} focusable={true} />
                )}
              </Button>
            </div>
            <div className="grid-col-auto padding-left-0">
              <Button
                variant="unstyled"
                className="card-name"
                onClick={() => {
                  navigate({
                    pathname: `/patient/${testOrder.patient.internalId}`,
                    search: `?facility=${facility!.id}&fromQueue=true`,
                  });
                }}
              >
                <span className={"font-sans-lg"}>
                  <strong>{patientFullName}</strong>
                </span>
              </Button>
            </div>
            <div className="grid-col-auto">
              <span className={"font-sans-sm text-base"}>
                DOB: {patientDateOfBirth.format("MM/DD/YYYY")}
              </span>
            </div>
            <div className="grid-col"></div>
            <div className="grid-col-auto padding-x-0">
              <TestTimerWidget timer={timer} context={timerContext} />
            </div>
            <div className="grid-col-auto close-button-col">
              <Button
                className={"card-close-button"}
                variant="unstyled"
                onClick={closeModalRef.current?.toggleModal}
              >
                <Icon.Close size={3} focusable={true} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="position-relative">
          <CardBody className={isOpen ? "padding-top-0" : "display-none"}>
            <TestCardForm
              testOrder={testOrder}
              devicesMap={devicesMap}
              facility={facility}
              refetchQueue={refetchQueue}
              startTestPatientId={startTestPatientId}
              setStartTestPatientId={setStartTestPatientId}
            ></TestCardForm>
          </CardBody>
        </div>
      </Card>
    </>
  );
};
