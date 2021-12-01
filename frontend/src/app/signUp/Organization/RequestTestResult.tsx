import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";

const RequestTestResult = () => {
  return (
    <CardBackground>
      <Card logo>
        <div className="usa-prose">
          <h2 className="margin-top-2">COVID-19 test results</h2>
          <p>
            COVID-19 test results are sent via email or SMS text message with a
            link to view your result.
          </p>
          <p>
            Having trouble getting your result? Contact your testing facility
            directly.
          </p>
        </div>
      </Card>
    </CardBackground>
  );
};

export default RequestTestResult;
