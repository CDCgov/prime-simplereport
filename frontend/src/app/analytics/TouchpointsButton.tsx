import "./TouchpointsButton.scss";
import { Button } from "@trussworks/react-uswds";

const TouchpointsButton: React.FC = () => {
  return (
    <Button
      type="button"
      className="touchpoints-wrapper sr-app-touchpoints-button"
    >
      How can we improve SimpleReport?
    </Button>
  );
};

export default TouchpointsButton;
