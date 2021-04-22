import { gql, useMutation } from "@apollo/client";
import React, {
  useState,
} from "react";
import classnames from "classnames";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../../commonComponents/QueryWrapper";
import "./PendingOrganizationsList.scss";
import Alert from "../../commonComponents/Alert";
import { toast } from "react-toastify";
import { showNotification } from "../../utils";
import Checkboxes from "../../commonComponents/Checkboxes";
import Button from "../../commonComponents/Button";

export const ORGANIZATIONS_QUERY = gql`
  query GetUnverifiedOrganizations(
    $identityVerified: Boolean
  ) {
    organizations(
      identityVerified: $identityVerified
    ) {
      id
      name
      externalId
      identityVerified
    }
  }
`;
export const SET_ORG_IDENTITY_VERIFIED_MUTATION = gql`
  mutation SetOrgIdentityVerified($externalId: String!, $verified: Boolean!) {
    setOrganizationIdentityVerified(externalId: $externalId, verified: $verified)
  }
`;

interface Props {
  data: any;
  refetch: () => void;
}

function orgRows(
  orgs: any,
  refetch: () => void,
) {
  if (orgs.length === 0) {
    return (
      <tr>
        <td>No results</td>
      </tr>
    );
  }

  return [...orgs].map((o) => {

    const [identityVerified, setIdentityVerified] = useState(
      o.identityVerified
    );
    const [verifyIdentity] = useMutation(SET_ORG_IDENTITY_VERIFIED_MUTATION);
    const submitIdentityVerified = () => {
      verifyIdentity({
        variables: {
          externalId: o.externalId,
          verified: identityVerified,
        },
      })
        .then(() => {
          const alert = (
            <Alert type="success" title={o.name+" identity verified"} body="" />
          );
          showNotification(toast, alert);
        })
        .finally(refetch);
    };

    return (
      <tr
        key={o.id}
        //title=""
        className={classnames(
          "sr-org-row"
        )}
      >
        <th scope="row">
          {o.name}
          <span className="display-block text-base font-ui-2xs">
            External ID: {o.externalId}
          </span>
        </th>
        <td>
          <Checkboxes
            onChange={(e) => setIdentityVerified(e.target.checked)}
            name="identity_verified"
            legend=""
            boxes={[
              {
                value: "1",
                label: "Identity Verified",
                checked: identityVerified,
              },
            ]}
          />
        </td>
        <td>
          <Button
            type="button"
            onClick={submitIdentityVerified}
            label="Save Changes"
            disabled={!identityVerified}
          />
        </td>
      </tr>
    );
  });
}

export const DetachedPendingOrganizationsList: any = ({
  data,
  refetch,
}: Props) => {

  const orgs = data?.organizations || [];

  const rows = orgRows(orgs, refetch);

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-pending-organizations-list">
            <div className="usa-card__header">
              <h2>
                Organizations Pending Identity Verification
              </h2>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Verify Identity</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

type OmittedProps =
  | InjectedQueryWrapperProps;

type PendingOrganizationsListProps = Omit<Props, OmittedProps>;

const PendingOrganizationsList = (props: PendingOrganizationsListProps) => {

  const queryVariables: {
    identityVerified: boolean;
  } = {
    identityVerified: false,
  };

  return (
    <QueryWrapper<Props>
      query={ORGANIZATIONS_QUERY}
      queryOptions={{
        variables: queryVariables,
      }}
      Component={DetachedPendingOrganizationsList}
      componentProps={{
        ...props,
      }}
    />
  );
};

export default PendingOrganizationsList;
