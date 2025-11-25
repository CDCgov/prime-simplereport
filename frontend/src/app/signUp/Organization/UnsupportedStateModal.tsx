import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";
import Checkboxes from "../../commonComponents/Checkboxes";
import { getStateNameFromCode } from "../../utils/state";

export type UnsupportedStateModalProps = {
  showModal: boolean;
  onClose: (clearField: boolean) => void;
  state: string;
};

export const UnsupportedStateModal: React.FC<UnsupportedStateModalProps> = ({
  showModal,
  onClose,
  state,
}) => {
  const [checkboxState, setCheckboxState] = useState(false);

  return (
    <Modal
      onClose={() => onClose(true)}
      showModal={showModal}
      showClose={true}
      contentLabel={"Unsupported State"}
      containerClassName={"unsupported-state-modal"}
    >
      <Modal.Header styleClassNames={"margin-0 line-height-sans-2"}>
        {getStateNameFromCode(state)} isn't connected to SimpleReport yet.
      </Modal.Header>
      <p>
        You can join the waitlist to be notified when SimpleReport is available
        in your state, or if your organization is reporting to a SimpleReport
        state, you can continue.
      </p>
      <Checkboxes
        name="acknowledge"
        legend=""
        onChange={() => {
          setCheckboxState(!checkboxState);
        }}
        boxes={[
          {
            value: "acknowledged",
            label: (
              <>
                My organization is submitting test results to a{" "}
                <a
                  href="https://simplereport.gov/using-simplereport/manage-facility-info/find-supported-jurisdictions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  state that is connected to SimpleReport
                </a>
                .
              </>
            ),
            checked: checkboxState,
            "aria-label": "acknowledged",
          },
        ]}
      />
      <Modal.Footer styleClassNames={"prime-right-align"}>
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              "https://simplereport.gov/waitlist",
              "Simple Report WaitList",
              "noopener"
            )
          }
        >
          Join waitlist
        </Button>
        <Button
          onClick={() => {
            onClose(false);
            setCheckboxState(false);
          }}
          disabled={!checkboxState}
        >
          Continue sign up
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
