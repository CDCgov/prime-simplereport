import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";

interface Props {
  email: string;
  activationToken: string;
}

const Success: React.FC<Props> = ({ email, activationToken }) => {
  const activationLink = `${process.env.PUBLIC_URL}/uac/?activationToken=${activationToken}`;

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
        <p className="margin-bottom-0">
          Congratulations, your identity has been verified successfully. Please
          click the button below to set up your SimpleReport account. (A link
          will also be sent to {email}).
        </p>
        <a className="usa-button width-full margin-top-3" href={activationLink}>
          Set up your account
        </a>
        <p className="usa-hint font-ui-xs margin-top-3">
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
