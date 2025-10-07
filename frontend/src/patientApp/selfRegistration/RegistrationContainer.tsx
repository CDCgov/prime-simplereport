import { useEffect, useState } from "react";

import PageNotFound from "../../app/commonComponents/PageNotFound";
import { PxpApi } from "../PxpApiService";

type Props = {
  registrationLink: string | undefined;
  setEntityName: (name: string) => void;
  children: React.ReactNode;
};

export const RegistrationContainer = ({
  children,
  registrationLink,
  setEntityName,
}: Props): JSX.Element => {
  const [isLinkValid, setIsLinkValid] = useState<boolean>();

  useEffect(() => {
    async function getEntityName() {
      try {
        const name = await PxpApi.getEntityName(registrationLink);
        setEntityName(name);
        setIsLinkValid(true);
      } catch {
        setIsLinkValid(false);
      }
    }
    getEntityName();
  }, [registrationLink, setEntityName]);

  if (isLinkValid === undefined) {
    return <>Loading...</>;
  }

  if (isLinkValid === false) {
    return <PageNotFound />;
  }

  return <>{children}</>;
};
