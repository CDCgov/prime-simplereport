import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";

interface Props {
  email: string;
}

const Success: React.FC<Props> = ({ email }) => {
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
        <h1 className="font-ui-lg margin-top-3 margin-bottom-4">
          You’re ready to use SimpleReport
        </h1>
        <p className="margin-bottom-2">
          Congratulations, your identity has been verified successfully. Please
          check your organization administrator email ({email}) for a link to
          access your SimpleReport account.
        </p>
        <p className="margin-bottom-0">
          Didn’t get the email? Check your spam folder. If you’re unable to find
          the email,{" "}
          <a href="mailto:support@simplereport.gov">
            contact SimpleReport support
          </a>
          .
        </p>
      </Card>
    </CardBackground>
  );
};

export default Success;
