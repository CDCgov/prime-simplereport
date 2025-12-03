import { useEffect, useState } from "react";
import Modal from "react-modal";

import logo from "../../img/simplereport-logomark-color.svg";

import Alert from "./Alert";
import Button from "./Button/Button";

const SESSION_IDENTIFIER = "trainingAcknowledged";
export const TRAINING_PURPOSES_ONLY =
  "This is a training site with sample data for demonstration purposes only.";

const initialAcknowledged = !!sessionStorage.getItem(SESSION_IDENTIFIER);

export const TrainingNotification: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(initialAcknowledged);

  useEffect(() => {
    if (acknowledged) {
      sessionStorage.setItem(SESSION_IDENTIFIER, "yes");
    }
  }, [acknowledged]);

  return (
    <>
      <div className="usa-site-alert usa-site-alert--info usa-site-alert--slim border-top border-base-lighter">
        <Alert type="info" role="alert">
          {TRAINING_PURPOSES_ONLY}
        </Alert>
      </div>
      <Modal
        isOpen={!acknowledged}
        style={{
          content: {
            maxHeight: "90vh",
            width: "50em",
            position: "initial",
          },
        }}
        overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
        contentLabel="SimpleReport training site"
        ariaHideApp={process.env.NODE_ENV !== "test"}
      >
        <div className="sr-training-modal margin-1">
          <div className="display-flex flex-align-start">
            <img
              src={logo}
              alt="SimpleReport logo"
              className="width-10 margin-right-3 margin-top-1"
            />
            <div className="usa-prose">
              <h1 className="font-heading-xl text-normal">
                Welcome to the SimpleReport training site!
              </h1>
              <h2 className="font-heading-lg text-normal margin-top-105">
                A few important reminders:
              </h2>
              <ul>
                <li>{TRAINING_PURPOSES_ONLY}</li>
                <li>
                  Don't enter personally identifiable information (PII) or
                  protected health information (PHI) on this site.
                </li>
                <li>
                  Results entered on this training site will not be reported.
                </li>
              </ul>
              <Button
                onClick={() => {
                  setAcknowledged(true);
                }}
                className="margin-right-0"
              >
                Got it, thanks
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
