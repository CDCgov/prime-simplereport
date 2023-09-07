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

export interface TestCardProps {
  testOrder: QueriedTestOrder;
  facility: QueriedFacility;
  devicesMap: DevicesMap;
}

export const TestCard = ({
  testOrder,
  facility,
  devicesMap,
}: TestCardProps) => {
  const navigate = useNavigate();
  const timer = useTestTimer(
    testOrder.internalId,
    testOrder.deviceType.testLength
  );
  const organization = useSelector<RootState, Organization>(
    (state: any) => state.organization as Organization
  );

  const [isOpen, setIsOpen] = useState(false);

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
    <Card className={"list-style-none"}>
      <CardHeader className={"padding-2"}>
        <div className="grid-container">
          <div className="grid-row grid-gap flex-align-center">
            <div className="grid-col-auto margin-top-05">
              <Button variant="unstyled" onClick={toggleOpen}>
                {isOpen ? (
                  <Icon.ExpandMore size={3} focusable={true} />
                ) : (
                  <Icon.ExpandLess size={3} focusable={true} />
                )}
              </Button>
            </div>
            <div className="grid-col-auto">
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
            <div className="grid-col-auto">
              <TestTimerWidget timer={timer} context={timerContext} />
            </div>
            <div className="grid-col-auto">
              <Button
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
        </div>
      </CardHeader>
      <CardBody className={isOpen ? "" : "display-none"}>
        <div className="grid-container">
          <TestCardForm
            testOrder={testOrder}
            devicesMap={devicesMap}
            facility={facility}
          ></TestCardForm>
        </div>
      </CardBody>
    </Card>
  );
};
