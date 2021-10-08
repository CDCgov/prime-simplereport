import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import Checkboxes from "../../../commonComponents/Checkboxes";
import { LinkWithQuery } from "../../../commonComponents/LinkWithQuery";
import "./OrderingProvider.scss";

export interface OrderingProviderListProps {
  providers: Provider[];
  defaultProvider: Provider | null;
  updateProviders: (providers: Provider[]) => void;
  updateDefaultProvider: (provider: Provider) => void;
}

const OrderingProviderList: React.FC<OrderingProviderListProps> = ({
  providers,
  defaultProvider,
  updateProviders,
  updateDefaultProvider,
}) => {
  const onProviderRemove = (provider: Provider, idx: number) => {
    const newProviders = [...providers];
    newProviders.splice(idx, 1);
    updateProviders(newProviders);
  };

  return (
    <div className="prime-container card-container" id="ordering-provider-list">
      <div className="usa-card__header padding-bottom-205">
        <h2 className="font-heading-lg">Manage providers</h2>
      </div>
      <div className="usa-card__body">
        <table
          className="usa-table usa-table--borderless"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th scope="col">Provider</th>
              <th scope="col">Phone number</th>
              <th scope="col"></th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(providers) && providers.length === 0 ? (
              <p>No ordering providers found</p>
            ) : (
              providers.map((provider, idx) => {
                return (
                  <tr key={idx}>
                    <td className="padding-y-2">
                      {/* TODO: route to add/edit provider page after https://github.com/CDCgov/prime-simplereport/issues/2667 */}
                      <LinkWithQuery
                        to={`/provider`}
                        className="sr-provider-edit-link"
                      >
                        {provider.firstName} {provider.lastName}
                      </LinkWithQuery>
                    </td>
                    <td>{provider.phone}</td>
                    <td>
                      <Checkboxes
                        onChange={() => updateDefaultProvider(provider)}
                        legend="Set default"
                        legendSrOnly
                        name="default_device"
                        boxes={[
                          {
                            value: "1",
                            label: "Set as default",
                            checked: provider === defaultProvider,
                          },
                        ]}
                      />
                    </td>
                    <td>
                      <button
                        className="usa-button--unstyled"
                        onClick={() => onProviderRemove(provider, idx)}
                        aria-label="Delete device"
                        disabled={providers.length <= 1}
                      >
                        <FontAwesomeIcon
                          icon={"trash"}
                          className={"prime-red-icon"}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="usa-card__footer padding-top-2 padding-bottom-205">
        <LinkWithQuery
          className="usa-button usa-button--outline"
          /* TODO: route to add/edit provider page after https://github.com/CDCgov/prime-simplereport/issues/2667 */
          to={`/provider`}
          id="add-provider-button"
        >
          <FontAwesomeIcon icon="plus" />
          {` Add provider`}
        </LinkWithQuery>
      </div>
    </div>
  );
};

export default OrderingProviderList;
