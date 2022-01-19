import { Card } from "../Card/Card";
import { CardBackground } from "../CardBackground/CardBackground";
import iconLoader from "../../../img/loader.svg";

interface Props {
  message?: string;
}

export const LoadingCard = ({ message = "Loading" }: Props) => {
  return (
    <CardBackground>
      <Card logo bodyKicker={`${message} …`} bodyKickerCentered={true}>
        <div className="display-flex flex-column flex-align-center">
          <img className="square-5 chromatic-ignore" src={iconLoader} alt="" />
        </div>
      </Card>
    </CardBackground>
  );
};
