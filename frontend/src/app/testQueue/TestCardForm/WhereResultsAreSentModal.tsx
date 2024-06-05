import React from "react";
import { Button } from "@trussworks/react-uswds";

import { TextWithTooltipButton } from "../../commonComponents/TextWithTooltipButton";
import Modal from "../../commonComponents/Modal";

export const WhereResultsAreSentModal: React.FC = () => {
  const [modalIsOpen, setIsOpen] = React.useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <TextWithTooltipButton
        text="Where results are sent"
        onClick={openModal}
      />
      <Modal
        showModal={modalIsOpen}
        contentLabel="Where are SimpleReport test results sent?"
        onClose={closeModal}
        containerClassName={"margin-1em"}
      >
        <Modal.Header styleClassNames={"font-sans-lg line-height-sans-3"}>
          Where are SimpleReport test results sent?
        </Modal.Header>
        <p>
          When you click submit, test results are automatically sent to your
          local public health departments as well as CDC. The data sent over
          includes other supporting information, such as a test device, specimen
          type, and your organization's contact information.
        </p>
        <p>
          Data that is sent to CDC is automatically stripped of personally
          identifiable data, such as name, in order to protect your patient's
          confidentiality.
        </p>
        <Button
          onClick={closeModal}
          type={"button"}
          className={"margin-top-2em"}
          data-testid={"button-where-results-are-sent-modal-confirm"}
        >
          Got it
        </Button>
      </Modal>
    </>
  );
};
