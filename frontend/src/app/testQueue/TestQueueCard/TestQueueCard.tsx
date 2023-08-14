import React from "react";
import { Accordion, Button } from "@trussworks/react-uswds";
import { AccordionItemProps } from "@trussworks/react-uswds/lib/components/Accordion/Accordion";

import Card from "../../commonComponents/Card/Card";

export const TestQueueCard = () => {
  const Header = () => (
    <div className="grid-row grid-gap margin-bottom-2">
      <div className="grid-col-auto">Patient Name</div>
      <div className="grid-col-auto">DOB: 06/8/2023</div>
      <div className="grid-col"></div>
      <div className="grid-col-auto flex-align-self-end">Start Timer</div>
      <div className="grid-col-auto flex-align-self-end">X</div>
    </div>
  );

  const SubmitResultsButton = () => (
    <Button type={"submit"}>Submit results</Button>
  );

  const TestInfoForm = () => (
    <>
      <div className="grid-row">Test date and time</div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">Test device</div>
        <div className="grid-col-auto">Specimen type</div>
      </div>
      <div className="grid-row">COVID-19 Result</div>
      <div className="grid-row">Is the patient pregnant?</div>
      <div className="grid-row">
        Is the patient currently experiencing any symptoms?
      </div>
      <SubmitResultsButton></SubmitResultsButton>
    </>
  );

  const TestInfoAccordionItem: AccordionItemProps = {
    expanded: false,
    headingLevel: "h4",
    id: "",
    title: "Test information",
    content: TestInfoForm(),
  };

  return (
    <Card>
      <div className="grid-container">
        {/* Header */}
        <Header />
        <Accordion items={[TestInfoAccordionItem]}></Accordion>
      </div>
    </Card>
  );
};
