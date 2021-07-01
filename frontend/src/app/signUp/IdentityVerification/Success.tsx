import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";

interface Props {
  email: string;
}

const Success: React.FC<Props> = ({ email }) => {
  return (
    <CardBackground>
      <Card>
        <p>Check your email: {email}</p>
      </Card>
    </CardBackground>
  );
};

export default Success;
