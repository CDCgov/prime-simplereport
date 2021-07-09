import React from "react";
import { useTranslation } from "react-i18next";

import Required from "./Required";

const RequiredMessage = () => {
  const { t } = useTranslation();

  return (
    <p className="message--required">
      {t("common.required")} (<Required />
      ).
    </p>
  );
};

export default RequiredMessage;
