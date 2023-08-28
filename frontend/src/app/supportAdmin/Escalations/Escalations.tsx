import React from "react";

import { useSendSupportEscalationMutation } from "../../../generated/graphql";
import Button from "../../commonComponents/Button/Button";
import { showSuccess } from "../../utils/srToast";
import { useDocumentTitle } from "../../utils/hooks";
import { escalationPageTitle } from "../pageTitles";
import SupportHomeLink from "../SupportHomeLink";

export const Escalations = () => {
  useDocumentTitle(escalationPageTitle);
  const [escalateToSlack] = useSendSupportEscalationMutation();

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="prime-container card-container padding-bottom-3">
          <div className="usa-card__header">
            <div className="width-full">
              <SupportHomeLink />
              <div className="grid-row width-full margin-top-1">
                <h1 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 font-heading-lg margin-bottom-0">
                  Escalate to engineering
                </h1>
              </div>
            </div>
          </div>
          <div className="usa-card__body margin-top-1">
            <form>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
