import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";

export const MfaComplete = () => {
  return (
    <CardBackground>
      <Card logo>
        <div className="display-flex flex-justify-center margin-top-2">
          <svg
            className="usa-icon usa-icon--size-8 text-success"
            aria-hidden="true"
            focusable="false"
            role="img"
          >
            <use xlinkHref={iconSprite + "#check_circle"}></use>
          </svg>
        </div>
        <h1 className="font-ui-lg margin-top-3">Account set up complete</h1>
        <p className="margin-bottom-0">
          To start using SimpleReport, log in to your account.
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
