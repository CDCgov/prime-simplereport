import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import { useDocumentTitle } from "../../utils/hooks";

const RequestTestResult = () => {
  useDocumentTitle("Get COVID-19 test results | SimpleReport");

  return (
    <CardBackground>
      <Card logo>
        <div className="usa-prose">
          <h1 className="margin-top-2 font-ui-xl">COVID-19 test results</h1>
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
