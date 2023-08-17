import React from "react";

import { useSendSupportEscalationMutation } from "../../../generated/graphql";
import Button from "../../commonComponents/Button/Button";
import { showSuccess } from "../../utils/srToast";
import { useDocumentTitle } from "../../utils/hooks";
import { escalationPageTitle } from "../pageTitles";

export const Escalations = () => {
  useDocumentTitle(escalationPageTitle);
  const [escalateToSlack] = useSendSupportEscalationMutation();

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <form className="prime-container card-container">
            <div className="usa-card__header">
              <h1 className="font-heading-lg margin-top-0 margin-bottom-0">
                Escalate to engineering
              </h1>
            </div>
            <div className="usa-card__body margin-top-1">
              <div className="grid-row grid-gap margin-top-2">
                <div className="tablet:grid-col">
                  <p className="usa-prose">
                    Use the below button to notify the SimpleReport engineering
                    team about a tier 2 escalation. Make sure you've filled out
                    information about the escalation in{" "}
                    <a
                      target="_blank"
                      href="https://app.smartsheetgov.com/sheets/wwchRWw4jr55WpX8XwC2h9Mr9rVr3Q3hww64pW61"
                      rel="noreferrer"
                    >
                      the Smartsheet tracker
                    </a>
                  </p>
                  <Button
                    className="width-half margin-top-2 submit-button"
                    onClick={async () => {
                      await escalateToSlack();
                      showSuccess(
                        "The engineering team has been notified that there's a new escalation and will be in touch shortly",
                        `Escalation successfully sent`
                      );
                    }}
                    label={"Submit escalation"}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
