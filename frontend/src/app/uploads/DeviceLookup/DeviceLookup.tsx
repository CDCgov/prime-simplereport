import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./DeviceLookup.scss";
import { uniq } from "lodash";

import SearchInput from "../../testQueue/addToQueue/SearchInput";
import { useDebounce } from "../../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../../testQueue/constants";
import { DeviceType } from "../../../generated/graphql";
import { useOutsideClick } from "../../utils/hooks";

import DeviceSearchResults from "./DeviceSearchResults";
import DeviceDetails from "./DeviceDetails";

interface Props {
  formTitle: string;
  deviceOptions: DeviceType[];
}

const searchFields = ["manufacturer", "name", "model"] as const;
type DeviceSearchFields = typeof searchFields[number];
type SearchableDevice = Pick<DeviceType, DeviceSearchFields>;

const searchDevices = (devices: DeviceType[], query: string): DeviceType[] => {
  if (!query) {
    return [];
  }

  const results: DeviceType[] = [];

  for (const field of searchFields) {
    results.push(
      ...devices.filter((d: DeviceType) => {
        const value = d[field as keyof SearchableDevice];
        return value.toLowerCase().includes(query.toLowerCase());
      })
    );
  }

  return uniq(results);
};

const DeviceLookup = (props: Props) => {
  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(true);

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;
  const showDropdown = useMemo(() => allowQuery && showSuggestion, [
    allowQuery,
    showSuggestion,
  ]);
  const dropDownRef = useRef(null);
  const hideOnOutsideClick = useCallback(() => {
    setShowSuggestion(false);
  }, []);

  useOutsideClick(dropDownRef, hideOnOutsideClick);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Search field is cleared out via cancel icon
    if (event.target.value === "") {
      setSelectedDevice(null);
      setDebounced("");
    } else {
      setShowSuggestion(true);
      setDebounced(event.target.value);
    }
  };

  const onSearchClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Close dropdown menu when a device is selected
  useEffect(() => {
    setShowSuggestion(false);
  }, [selectedDevice]);

  return (
    <div className="prime-home device-lookup-container flex-1">
      <div className="grid-container">
        <div className="prime-container card-container">
          <div className="usa-card__header">
            <h1 className="font-sans-lg">Device code lookup</h1>
          </div>
          <div className="usa-card__body margin-top-1">
            <strong
              className="display-block margin-bottom-1em"
              id="select-device"
            >
              Select device
            </strong>
            <div className="position-relative">
              <SearchInput
                onSearchClick={onSearchClick}
                onInputChange={onInputChange}
                queryString={debounced}
                placeholder={"Search for a device"}
                labeledBy="select-device"
              />
              <DeviceSearchResults
                devices={searchDevices(props.deviceOptions, queryString)}
                setSelectedDevice={setSelectedDevice}
                shouldShowSuggestions={showDropdown}
                loading={debounced !== queryString}
                queryString={queryString}
                dropDownRef={dropDownRef}
              />
              {selectedDevice && <DeviceDetails device={selectedDevice} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceLookup;
