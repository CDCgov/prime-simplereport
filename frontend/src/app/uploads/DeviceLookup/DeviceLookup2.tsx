import React, { useCallback, useMemo, useState } from "react";

import "./DeviceLookup.scss";
import SearchInput from "../../testQueue/addToQueue/SearchInput";
import { useDebounce } from "../../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../../testQueue/constants";
import { DeviceType } from "../../../generated/graphql";

import DeviceSearchResults from "./DeviceSearchResults";

/*
    TODO: DRY out interfaces
 */

interface SwabType {
  swabName: string;
  typeCode: string;
  internalId: string;
}

interface Props {
  formTitle: string;
  swabOptions: Array<SwabType>;
  deviceOptions: DeviceType[];
}

const DeviceLookup = (props: Props) => {
  // Page title
  // Device search bar
  //
  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });
  const [showSuggestion, setShowSuggestion] = useState(true);

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;

  const showDropdown = useMemo(() => allowQuery && showSuggestion, [
    allowQuery,
    showSuggestion,
  ]);
  const hideOnOutsideClick = useCallback(() => {
    setShowSuggestion(false);
  }, []);
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowSuggestion(true);
    setDebounced(event.target.value);
  };

  const onSearchClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <main className="prime-home">
      <div className="grid-container queue-container-wide">
        <h1 className="font-sans-lg">Device lookup</h1>
        <div className="position-relative">
          <SearchInput
            onSearchClick={onSearchClick}
            onInputChange={onInputChange}
            queryString={debounced}
            placeholder={"Search for a device"}
          />
          <DeviceSearchResults
            devices={props.deviceOptions}
            shouldShowSuggestions={showDropdown}
            loading={false}
          />
        </div>
      </div>
    </main>
  );
};

export default DeviceLookup;
