import CardBackground from "../commonComponents/CardBackground/CardBackground";
import Card from "../commonComponents/Card/Card";
import { useDocumentTitle } from "../utils/hooks";

const SessionTimeout = () => {
  useDocumentTitle("Session timeout");

  return (
    <main>
      <CardBackground>
        <Card logo>
          <h1 className={"font-ui-md text-bold margin-top-3"}>
            Your session has expired
          </h1>
          <p>
            Please contact your account administrator to request a new
            activation link.
          </p>
        </Card>
      </CardBackground>
    </main>
  );
};

export default SessionTimeout;
