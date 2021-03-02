import React from 'react';
import classnames from 'classnames';

const Optional = (props: { label?: React.ReactNode; className?: string }) => (
  <>
    {props.label}
    <span className={classnames('usa-hint', props.className)}> (optional)</span>
  </>
);

export default Optional;
