import React from "react";

import { useDocumentTitle } from "../utils/hooks";

export interface PageContainerProps {
  title: String;
  controls?: React.ReactNode;
  children: React.ReactNode;
}
const PageContainer = ({ title, controls, children }: PageContainerProps) => {
  useDocumentTitle("Manage Facility");

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="prime-container card-container">
          <div className="usa-card__header">
            <h1 className="font-heading-lg margin-top-0 margin-bottom-0">
              {title}
            </h1>
          </div>
          {controls && (
            <div className="bg-base-lightest padding-left-3 padding-right-3 padding-bottom-1">
              {controls}
            </div>
          )}
          <div className="usa-card__body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
