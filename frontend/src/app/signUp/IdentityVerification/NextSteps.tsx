import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import { useDocumentTitle } from "../../utils/hooks";

const NextSteps = () => {
  useDocumentTitle("Sign up - schedule call");

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-lg margin-top-3 margin-bottom-4">
          Identity verification call
        </h1>
        <p className="margin-bottom-2">
          Experian was unable to verify your identity. You’ll need to schedule a
          quick identity verification call with our customer support team
          instead.
        </p>
        <p className="margin-bottom-0">
          Your SimpleReport account will be accessible after your identity is
          verified.
        </p>
        <a
          className="usa-button width-full margin-top-3"
          href="https://calendly.com/simplereport-id-verification-sessions/simplereport-id-verification-sessions?back=1&month=2022-05"
        >
          Schedule identity verification
        </a>
      </Card>
    </CardBackground>
  );
};

export default NextSteps;
