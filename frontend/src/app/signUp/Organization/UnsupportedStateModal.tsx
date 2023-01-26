import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";
import Checkboxes from "../../commonComponents/Checkboxes";

const noop = () => {
  /**
   * The `onClose` callback is technically optional in this component but not
   * in the child `Modal` component. Pass a no-op callback to the inner
   * component to satisfy the prop type requirement
   */
};

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
      variant="warning"
      contentLabel={"Unsupported State"}
      containerClassName={"unsupported-state-modal"}
    >
      <Modal.Header
        styleClassNames={"margin-0 font-sans-lg line-height-sans-2"}
      ></Modal.Header>
      <p>
        {state} isn't connected to SimpleReport yet.
        <br />
        <br />
        You can join the waitlist to be notified when SimpleReport is available
        in your state, or if your organization is reporting to a SimpleReport
        state, you can continue.
      </p>
      <Checkboxes
        name="acknowledge"
        legend=""
        onChange={(e) => {
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
          },
        ]}
      />
      <Modal.Footer styleClassNames={"prime-right-align"}>
        <a
          href={"https://simplereport.gov/waitlist"}
          target={"_blank"}
          rel="noopener noreferrer"
        >
          <Button>Join waitlist</Button>
        </a>
        {onClose && (
          <Button
            onClick={() => {
              onClose(false);
              setCheckboxState(false);
            }}
            disabled={!checkboxState}
          >
            Continue sign up
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
