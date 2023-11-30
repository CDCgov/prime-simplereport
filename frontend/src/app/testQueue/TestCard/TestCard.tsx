import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Icon,
  ModalRef,
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

import CloseTestCardModal from "./CloseTestCardModal";

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

  const [isExpanded, setIsExpanded] = useState(true);

  const testCardElement = useRef() as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    if (startTestPatientId === testOrder.patient.internalId) {
      testCardElement.current.scrollIntoView({ behavior: "smooth" });
    }
    // only run on first render to prevent disruptive repeated scrolls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerContext = {
    organizationName: organization.name,
    facilityName: facility!.name,
    patientId: testOrder.patient.internalId,
    testOrderId: testOrder.internalId,
  };

  const { patientFullName, patientDateOfBirth } =
    useTestOrderPatient(testOrder);

  const toggleExpanded = () => setIsExpanded((prevState) => !prevState);

  const removeTestFromQueue = async () => {
    await removePatientFromQueue(testOrder.patient.internalId);
    removeTimer(testOrder.internalId);
  };

  return (
    <>
      <CloseTestCardModal
        closeModalRef={closeModalRef}
        name={patientFullName}
        removeTestFromQueue={removeTestFromQueue}
      />
      <Card
        className={
          "list-style-none margin-bottom-1em test-card-container prime-queue-item"
        }
        data-testid={`test-card-${testOrder.patient.internalId}`}
      >
        <CardHeader
          className={`padding-2 ${
            isExpanded ? "test-card-header-bottom-border" : ""
          }`}
        >
          <div
            className="grid-row grid-gap flex-align-center"
            ref={testCardElement}
          >
            <div className="grid-col-auto margin-top-05">
              <Button
                variant="unstyled"
                onClick={toggleExpanded}
                ariaLabel={
                  isExpanded
                    ? `Collapse test for ${patientFullName}`
                    : `Expand test for ${patientFullName}`
                }
              >
                {isExpanded ? (
                  <Icon.ExpandLess
                    size={3}
                    focusable={true}
                    role={"presentation"}
                  />
                ) : (
                  <Icon.ExpandMore
                    size={3}
                    focusable={true}
                    role={"presentation"}
                  />
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
                <h2 className={"font-sans-lg margin-y-0"}>
                  <strong>{patientFullName}</strong>
                </h2>
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
                ariaLabel={`Close test for ${patientFullName}`}
              >
                <Icon.Close size={3} focusable={true} role={"presentation"} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="position-relative">
          <CardBody className={isExpanded ? "padding-top-0" : "display-none"}>
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
