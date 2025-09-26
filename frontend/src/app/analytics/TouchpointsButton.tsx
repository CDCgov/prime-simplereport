import "./TouchpointsButton.scss";
import Button from "../commonComponents/Button/Button";

const TouchpointsButton: React.FC = () => {
  return (
    <Button className="touchpoints-wrapper sr-app-touchpoints-button">
      How can we improve SimpleReport?
    </Button>
  );
};

export default TouchpointsButton;
