import React, { useState } from "react";
import { Card, CardBody, CardHeader, Icon } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";

import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { displayFullName } from "../../utils";
import Button from "../../commonComponents/Button/Button";
import { TestTimerWidget, useTestTimer } from "../TestTimer";
import { RootState } from "../../store";

import TestCardForm from "./TestCardForm";

import "./TestCard.scss";

export type SaveStatus = "idle" | "editing" | "saving" | "error";

export interface TestCardProps {
  testOrder: QueriedTestOrder;
  facility: QueriedFacility;
  devicesMap: DevicesMap;
  refetchQueue: () => void;
}

export const TestCard = ({
  testOrder,
  facility,
  devicesMap,
  refetchQueue,
}: TestCardProps) => {
  const navigate = useNavigate();
  const timer = useTestTimer(testOrder.internalId, 0.5);
  const organization = useSelector<RootState, Organization>(
    (state: any) => state.organization as Organization
  );

  const [isOpen, setIsOpen] = useState(true);

  const timerContext = {
    organizationName: organization.name,
    facilityName: facility!.name,
    patientId: testOrder.patient.internalId,
    testOrderId: testOrder.internalId,
  };

  const patientFullName = displayFullName(
    testOrder.patient.firstName,
    testOrder.patient.middleName,
    testOrder.patient.lastName
  );

  const patientDateOfBirth = moment(testOrder.patient.birthDate);

  const toggleOpen = () => setIsOpen((prevState) => !prevState);

  return (
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
          <div className="grid-col-auto">
            <Button
              className={"close-button"}
              variant="unstyled"
              onClick={() => {
                navigate({
                  pathname: `/patient/${testOrder.patient.internalId}`,
                  search: `?facility=${facility!.id}&fromQueue=true`,
                });
              }}
            >
              <Icon.Close size={3} focusable={true} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <div className="position-relative">
        <CardBody className={isOpen ? "" : "display-none"}>
          <TestCardForm
            testOrder={testOrder}
            devicesMap={devicesMap}
            facility={facility}
            refetchQueue={refetchQueue}
          ></TestCardForm>
        </CardBody>
      </div>
    </Card>
  );
};
