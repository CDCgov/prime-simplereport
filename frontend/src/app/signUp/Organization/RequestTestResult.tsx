import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";

const RequestTestResult = () => {
  return (
    <CardBackground>
      <Card logo>
        <h2>COVID-19 test results</h2>
        <p>
          COVID-19 test results are sent via email or SMS text message with a
          link to view your result.
        </p>
        <p>
          Having trouble getting your result? Contact your testing facility or
          email{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          with your testing location and the date of your test.
        </p>
      </Card>
    </CardBackground>
  );
};

export default RequestTestResult;
