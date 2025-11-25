import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
import React, { MouseEventHandler } from "react";

import SupportHomeLink from "../SupportHomeLink";
import Button from "../../commonComponents/Button/Button";
import SearchInput from "../../testQueue/addToQueue/SearchInput";

interface UserSearchProps {
  onClearFilter: () => void;
  onSearchClick: MouseEventHandler<HTMLButtonElement>;
  onInputChange: (e: any) => void;
  searchEmail: string;
  disableClearFilters: boolean;
}
export const UserSearch: React.FC<UserSearchProps> = ({
  onClearFilter,
  onSearchClick,
  onInputChange,
  searchEmail,
  disableClearFilters,
}) => {
  return (
    <div className="prime-container card-container padding-bottom-3">
      <div className="usa-card__header">
        <div className="width-full">
          <SupportHomeLink />
          <div className="grid-row width-full margin-top-1">
            <h1 className="desktop:grid-col-fill tablet:grid-col-fill mobile:grid-col-12 margin-bottom-0">
              Manage users
            </h1>
            <div className="desktop:grid-col-auto tablet:grid-col-auto mobile:grid-col-12 margin-top-2 tablet:margin-top-0">
              <Button
                icon={faSlidersH}
                disabled={disableClearFilters}
                onClick={onClearFilter}
                ariaLabel="Clear user search"
              >
                Clear filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div
        role="search"
        className="bg-base-lightest padding-left-3 padding-right-3 padding-bottom-1"
      >
        <div className="grid-row grid-gap padding-top-2 padding-bottom-1 flex-align-end">
          <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
            <SearchInput
              onInputChange={onInputChange}
              onSearchClick={onSearchClick}
              queryString={searchEmail}
              placeholder={"email@example.com"}
              label={"Search by email address of user"}
              disabled={!searchEmail || searchEmail.trim() === ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
