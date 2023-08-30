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

import TestForm from "./TestForm";
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
  // const [cardBorder]

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

  return (
    <Card className={"list-style-none"}>
      <CardHeader>
        <div className="grid-container">
          <div className="grid-row grid-gap flex-align-center">
            <div className="grid-col-auto">
              <Button
                variant="unstyled"
                onClick={() => setIsOpen((prevState) => !prevState)}
              >
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
      {isOpen && (
        <CardBody>
          <div className="grid-container">
            {/*<div className="grid-row grid-gap flex-align-center">*/}

            {/*  <div className="grid-col-auto">Test information</div>*/}
            {/*</div>*/}
            {/*<Accordion*/}
            {/*  // bordered={true}*/}
            {/*  items={[*/}
            {/*    {*/}
            {/*      expanded: false,*/}
            {/*      headingLevel: "h4",*/}
            {/*      id: "",*/}
            {/*      title: "Test information",*/}
            {/*      content: (*/}
            {/*        <TestForm*/}
            {/*          testOrder={testOrder}*/}
            {/*          facility={facility}*/}
            {/*          devicesMap={devicesMap}*/}
            {/*        />*/}
            {/*      ),*/}
            {/*    },*/}
            {/*  ]}*/}
            {/*></Accordion>*/}
            <div className="margin-top-2">
              <TestForm
                testOrder={testOrder}
                devicesMap={devicesMap}
                facility={facility}
              ></TestForm>
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  );
};
