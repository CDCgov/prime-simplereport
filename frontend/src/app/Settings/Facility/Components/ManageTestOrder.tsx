import React from "react";
import classNames from "classnames";
// import MultiSelect from '../../../commonComponents/MultiSelect/MultiSelect';

const CardContainer = ({
  className,
  headingText,
  children,
}: {
  className?: string;
  headingText?: string;
  children?: React.ReactNode;
}) => (
  <div className={classNames("prime-container card-container", className)}>
    {headingText && (
      <div className="usa-card__header">
        <h2 className="font-heading-lg">{headingText}</h2>
      </div>
    )}

    {/*<div className="usa-card__body">*/}
    {children}
    {/*</div>*/}
  </div>
);

const ManageTestOrder = () => {
  return (
    <CardContainer
      className="test-order-settings"
      headingText="Manage test orders for all conditions"
    >
      <div className="position-relative bg-base-lightest">
        <div className="display-flex grid-row grid-gap flex-row flex-align-end padding-x-3 padding-y-2">
          sup
        </div>
      </div>
    </CardContainer>
  );
};

export default ManageTestOrder;
