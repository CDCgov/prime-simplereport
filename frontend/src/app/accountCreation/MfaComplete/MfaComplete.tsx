import { Icon } from "@trussworks/react-uswds";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaComplete = () => {
  useDocumentTitle("Account set up complete");

  return (
    <CardBackground>
      <Card logo>
        <div className="display-flex flex-justify-center margin-top-2">
          <Icon.CheckCircle
            size={8}
            className={"text-success"}
          ></Icon.CheckCircle>
        </div>
        <h1 className="font-ui-lg margin-top-3">Account set up complete</h1>
        <p className="margin-bottom-0">
          To start using SimpleReport, visit the website to log in to your
          account.
        </p>
        <div className="display-flex flex-justify-center">
          <Button
            className="margin-top-3 flex-justify-center"
            label={"Continue to SimpleReport"}
            type={"submit"}
            onClick={() => (window.location.pathname = "/")}
          />
        </div>
      </Card>
    </CardBackground>
  );
};
