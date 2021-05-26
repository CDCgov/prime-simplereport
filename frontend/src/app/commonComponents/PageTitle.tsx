import React from "react";
import { Helmet } from "react-helmet";

interface Props {
  title: string;
}

const WithPageTitle: React.FC<Props> = ({ title }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </>
  );
};

export default WithPageTitle;
