import "./CardBackground.scss";

type CardBackgroundProps = {
  children?: React.ReactNode;
};

export const CardBackground = ({
  children,
}: CardBackgroundProps): JSX.Element => {
  return (
    <div className="card__background bg-base-lightest">
      <div className="grid-container maxw-mobile-lg usa-section">
        {children}
      </div>
    </div>
  );
};

export default CardBackground;
