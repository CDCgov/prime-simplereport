import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import { useDocumentTitle } from "../../utils/hooks";

const NextSteps = () => {
  useDocumentTitle("Sign up - schedule call");

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-lg margin-top-3 margin-bottom-3">
          Identity verification needed
        </h1>
        <p className="margin-bottom-2">
          We were unable to verify your identity. Your security is important to
          us. Let's schedule a phone call to get you back on track.
        </p>
        <p className="margin-bottom-2">
          Email{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          to schedule a call to verify your identity and address any other
          questions you may have.
        </p>
      </Card>
    </CardBackground>
  );
};

export default NextSteps;
