import React from "react";
import { Button } from "@trussworks/react-uswds";

import { TextWithTooltipButton } from "../../commonComponents/TextWithTooltipButton";
import Modal from "../../commonComponents/Modal";

interface Props {
  tooltipText?: string;
  modalTitle?: string;
}

export const WhereResultsAreSentModal: React.FC = ({
  tooltipText = "Where results are sent",
  modalTitle = "Where are SimpleReport test results sent?",
}: Props) => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <>
      <TextWithTooltipButton text={tooltipText} onClick={openModal} />
      <Modal
        showModal={modalIsOpen}
        contentLabel={modalTitle}
        onClose={closeModal}
        containerClassName={"margin-1em"}
      >
        <Modal.Header styleClassNames={"font-sans-lg line-height-sans-3"}>
          {modalTitle}
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
          className={"margin-top-105"}
          data-testid={"button-where-results-are-sent-modal-confirm"}
        >
          Got it
        </Button>
      </Modal>
    </>
  );
};
