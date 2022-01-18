import CardBackground from "../commonComponents/CardBackground/CardBackground";
import Card from "../commonComponents/Card/Card";

const SessionTimeout = () => {
  return (
    <main>
      <CardBackground>
        <Card logo bodyKicker={"Your session has expired"}>
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
