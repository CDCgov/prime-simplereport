export type CardContainerProps = {};

export const CardBackground: React.FC<CardContainerProps> = ({ children }) => {
  return (
    <div className="bg-base-lightest">
      <div className="grid-container maxw-mobile-lg usa-section">
        {children}
      </div>
    </div>
  );
};

export default CardBackground;
