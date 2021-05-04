import CardBackground from "../CardBackground/CardBackground";
import Card from "../Card/Card";

export type CardContainerProps = {
  logo?: boolean;
};

export const CardContainer: React.FC<CardContainerProps> = ({ children }) => {
  return (
    <CardBackground>
      <Card logo>{children}</Card>
    </CardBackground>
  );
};
