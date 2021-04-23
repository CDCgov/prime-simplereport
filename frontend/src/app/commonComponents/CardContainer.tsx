import CardBackground from "./CardBackground";
import Card from "./Card";

export type CardContainerProps = {
  logo?: boolean;
};

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
}) => {
  return (
    <CardBackground>
      <Card logo>
        {children}
      </Card>
    </CardBackground>
  );
};
