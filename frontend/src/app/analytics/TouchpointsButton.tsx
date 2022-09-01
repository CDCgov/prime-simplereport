import "./TouchpointsButton.scss";

interface Props {
  isModalActive?: boolean;
}

const TouchpointsButton: React.FC<Props> = (props) => {
  return (
    <button
      className="touchpoints-wrapper sr-app-touchpoints-button"
      aria-hidden={props.isModalActive}
    >
      How can we improve SimpleReport?
    </button>
  );
};

export default TouchpointsButton;
