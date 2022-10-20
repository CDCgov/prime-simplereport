import { useTranslation } from "react-i18next";

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="grid-container usa-section maxw-tablet usa-prose">
      <h1>{t("common.pageNotFound.heading")}</h1>
      <p>{t("common.pageNotFound.text")}</p>
      <p>{t("common.pageNotFound.errorCode")}</p>
    </div>
  );
};

export default PageNotFound;
