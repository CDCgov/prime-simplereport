import React from "react";
import { Button } from "@trussworks/react-uswds";

import { TextWithTooltipButton } from "../../../commonComponents/TextWithTooltipButton";
import Modal from "../../../commonComponents/Modal";

interface Props {
  tooltipText?: string;
  modalTitle?: string;
  showSyphilis?: boolean;
}

export const SensitiveTopicsTooltipModal = ({
  tooltipText = "Why SimpleReport asks about sensitive topics like this",
  modalTitle = "Why we ask for gender of sexual partners and other sensitive topics",
  showSyphilis = false,
}: Props): React.ReactElement => {
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
        <h2 className={"font-sans-md margin-bottom-05em"}>
          Gender of sexual partners
        </h2>
        <p className={"margin-top-05em"}>
          This helps public health departments understand which types of sexual
          connections are leading to STI spread and understand which populations
          to focus their support on.
        </p>
        <h2 className={"font-sans-md margin-bottom-05em"}>Patient pregnancy</h2>
        <p className={"margin-top-05em"}>
          If a patient is pregnant, this increases the public health
          department's prioritization of the patient's care as STIs can pass
          onto the child.
        </p>
        {showSyphilis && (
          <>
            <h2 className={"font-sans-md margin-bottom-05em"}>
              Syphilis symptoms
            </h2>
            <p className={"margin-top-05em"}>
              This helps public health departments understand which stage of
              syphilis the patient may be in.
            </p>
            <h2 className={"font-sans-md margin-bottom-05em"}>
              When someone's had syphilis before
            </h2>
            <p className={"font-sans-md margin-top-05em"}>
              If a patient has ever had syphilis, rapid tests will always return
              positive. This helps public health departments understand if this
              is a new case of syphilis.
            </p>
          </>
        )}
        <Button
          onClick={closeModal}
          type={"button"}
          className={"margin-top-105em"}
          data-testid={"button-sensitive-topics-modal-confirm"}
        >
          Got it
        </Button>
      </Modal>
    </>
  );
};
