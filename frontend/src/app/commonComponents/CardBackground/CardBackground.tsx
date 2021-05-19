import "./CardBackground.scss";

export type CardContainerProps = {};

export const CardBackground: React.FC<CardContainerProps> = ({ children }) => {
  return (
    <div className="card__background bg-base-lightest">
      <div className="grid-container maxw-mobile-lg usa-section">
        {children}
      </div>
    </div>
  );
};

export default CardBackground;
