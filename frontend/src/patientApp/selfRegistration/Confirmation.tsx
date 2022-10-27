import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Trans, useTranslation } from "react-i18next";

import { useDocumentTitle } from "../../app/utils/hooks";

type Props = {
  personName: string;
  entityName: string;
};

export const Confirmation = ({ personName, entityName }: Props) => {
  const { t } = useTranslation();

  useDocumentTitle(t("selfRegistration.confirmation.title"));

  return (
    <div className="grid-container maxw-tablet padding-y-3">
      <div className="prime-formgroup" id="self-reg-confirmation">
        <div className="grid-row flex-no-wrap flex-align-center">
          <FontAwesomeIcon
            className="text-green font-ui-3xl"
            icon={faCheckCircle}
          />
          <p className="padding-left-2">
            <Trans t={t} i18nKey="selfRegistration.confirmation.registered">
              <span className="text-bold">{{ personName }}</span>, thanks for
              completing your patient profile at {{ entityName }}.
            </Trans>
          </p>
        </div>
        <div>
          <p>{t("selfRegistration.confirmation.checkIn")}</p>
        </div>
      </div>
    </div>
  );
};
