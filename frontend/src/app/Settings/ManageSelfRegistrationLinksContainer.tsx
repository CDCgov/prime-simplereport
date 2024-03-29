import { useQuery, gql } from "@apollo/client";

import { getUrl } from "../utils/url";
import { useDocumentTitle } from "../utils/hooks";

import { ManageSelfRegistrationLinks } from "./ManageSelfRegistrationLinks";

type Data = {
  whoami: {
    organization: {
      patientSelfRegistrationLink: string;
      facilities: { name: string; patientSelfRegistrationLink: string }[];
    };
  };
};

export const REGISTRATION_LINKS_QUERY = gql`
  query AllSelfRegistrationLinks {
    whoami {
      organization {
        patientSelfRegistrationLink
        facilities {
          name
          patientSelfRegistrationLink
        }
      }
    }
  }
`;

export const ManageSelfRegistrationLinksContainer = () => {
  useDocumentTitle("Patient self-registration");

  const { data, loading, error } = useQuery<Data, {}>(
    REGISTRATION_LINKS_QUERY,
    {
      fetchPolicy: "no-cache",
    }
  );

  if (loading) {
    return <p> Loading... </p>;
  }

  if (error) {
    throw error;
  }

  if (data === undefined) {
    return <p>Error: setting not found</p>;
  }

  const organizationSlug = data.whoami.organization.patientSelfRegistrationLink;
  const facilitySlugs = data.whoami.organization.facilities.map(
    ({ name, patientSelfRegistrationLink }) => ({
      name,
      slug: patientSelfRegistrationLink,
    })
  );

  return (
    <ManageSelfRegistrationLinks
      baseUrl={getUrl() || ""}
      organizationSlug={organizationSlug}
      facilitySlugs={facilitySlugs}
      howItWorksPath="/using-simplereport/manage-people-you-test/self-registration"
    />
  );
};
