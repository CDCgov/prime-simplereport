import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";

export const Thanks = () => {
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
        <h1 className="margin-top-3">
          You’re on your way to simpler reporting!
        </h1>
        <h2>Next step: Schedule identity verification </h2>
        <p className="margin-bottom-0">
          The last step to get access to SimpleReport is{" "}
          <a href="https://outlook.office365.com/owa/calendar/Helpdesk@HHSGOV.onmicrosoft.com/bookings/s/HOX7KgZruESJksIgC8qVxQ2">
            scheduling your identity verification
          </a>
          . We’ve also sent the scheduling link and more details to the email
          address provided.
        </p>
        <p>
          Didn’t get the email? Check your spam folder then contact{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>
        </p>
        <div className="margin-top-4 border-top border-base-lighter margin-x-neg-4"></div>
        <div className="margin-top-4 usa-prose">
          <p>
            <a
              className="display-flex flex-align-center line-height-sans-1"
              href="/getting-started/organizations-and-testing-facilities/get-training/"
            >
              <span>Watch training videos</span>
            </a>
          </p>
          <p className="margin-top-205">
            <a
              className="display-flex flex-align-center line-height-sans-1"
              href="/using-simplereport/"
            >
              <span>Read how-to guides</span>
            </a>
          </p>
        </div>
      </Card>
    </CardBackground>
  );
};
