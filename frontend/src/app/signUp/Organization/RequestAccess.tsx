import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";

const RequestAccess = () => {
  return (
    <CardBackground>
      <Card logo>
        <div className="usa-prose">
          <h2 className="margin-top-2">Request access to SimpleReport</h2>
          <p>
            You’ll need to contact a SimpleReport account administrator at your
            organization or workplace to request access to SimpleReport.
          </p>
          <p>
            Not sure who the SimpleReport admins are at your organization? Email{" "}
            <a href="mailto:support@simplereport.gov">
              support@simplereport.gov
            </a>
            .
          </p>
        </div>
      </Card>
    </CardBackground>
  );
};

export default RequestAccess;
