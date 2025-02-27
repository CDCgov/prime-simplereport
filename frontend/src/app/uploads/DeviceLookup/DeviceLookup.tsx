import React, { useEffect, useMemo, useState } from "react";
import "./DeviceLookup.scss";
import { uniq } from "lodash";
import { useFeature } from "flagged";

import SearchInput from "../../testQueue/addToQueue/SearchInput";
import { useDebounce } from "../../testQueue/addToQueue/useDebounce";
import {
  MIN_SEARCH_CHARACTER_COUNT,
  SEARCH_DEBOUNCE_TIME,
} from "../../testQueue/constants";
import { DeviceType } from "../../../generated/graphql";
import iconSprite from "../../../../node_modules/@uswds/uswds/dist/img/sprite.svg";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import ScrollToTopOnMount from "../../commonComponents/ScrollToTopOnMount";
import { SearchableDevice, searchFields } from "../../utils/device";
import useComponentVisible from "../../commonComponents/ComponentVisible";

import DeviceSearchResults from "./DeviceSearchResults";
import DeviceDetails from "./DeviceDetails";

interface Props {
  deviceOptions: DeviceType[];
}

export const searchDevices = (
  devices: DeviceType[],
  query: string
): DeviceType[] => {
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
  const hivBulkUploadEnabled = useFeature("hivBulkUploadEnabled") as boolean;
  const gonorrheaEnabled = useFeature("gonorrheaEnabled") as boolean;
  const hepatitisCEnabled = useFeature("hepatitisCEnabled") as boolean;
  const syphilisEnabled = useFeature("syphilisEnabled") as boolean;
  const chlamydiaEnabled = useFeature("chlamydiaEnabled") as boolean;

  let deviceDisplayOptions = props.deviceOptions;
  if (!hivBulkUploadEnabled) {
    deviceDisplayOptions = deviceDisplayOptions.filter(
      (d) =>
        !d.supportedDiseaseTestPerformed
          .map((s) => s.supportedDisease)
          .map((sup) => sup.name)
          .includes("HIV")
    );
  }

  if (!gonorrheaEnabled) {
    deviceDisplayOptions = deviceDisplayOptions.filter(
      (d) =>
        !d.supportedDiseaseTestPerformed
          .map((s) => s.supportedDisease)
          .map((sup) => sup.name.toLowerCase())
          .includes("gonorrhea")
    );
  }

  if (!hepatitisCEnabled) {
    deviceDisplayOptions = deviceDisplayOptions.filter(
      (d) =>
        !d.supportedDiseaseTestPerformed
          .map((s) => s.supportedDisease)
          .map((sup) => sup.name.toLowerCase())
          .includes("hepatitis C")
    );

    if (!syphilisEnabled) {
      deviceDisplayOptions = deviceDisplayOptions.filter(
        (d) =>
          !d.supportedDiseaseTestPerformed
            .map((s) => s.supportedDisease)
            .map((sup) => sup.name.toLowerCase())
            .includes("syphilis".toLowerCase())
      );
    }

    console.log(
      "All devices:",
      deviceDisplayOptions.map((d) => ({
        name: d.name,
        diseases: d.supportedDiseaseTestPerformed.map(
          (s) => s.supportedDisease.name
        ),
      }))
    );
    if (!chlamydiaEnabled) {
      deviceDisplayOptions = deviceDisplayOptions.filter(
        (d) =>
          !d.supportedDiseaseTestPerformed
            .map((s) => s.supportedDisease)
            .map((sup) => sup.name.toLowerCase())
            .includes("chlamydia")
      );
    }
  }

  const [queryString, debounced, setDebounced] = useDebounce("", {
    debounceTime: SEARCH_DEBOUNCE_TIME,
    runIf: (q) => q.length >= MIN_SEARCH_CHARACTER_COUNT,
  });
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const {
    ref: dropDownRef,
    isComponentVisible: showSuggestion,
    setIsComponentVisible: setShowSuggestion,
  } = useComponentVisible(true);

  const allowQuery = debounced.length >= MIN_SEARCH_CHARACTER_COUNT;
  const showDropdown = useMemo(
    () => allowQuery && showSuggestion,
    [allowQuery, showSuggestion]
  );

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
  }, [selectedDevice, setShowSuggestion]);

  return (
    <div className="device-lookup-container prime-container card-container">
      <ScrollToTopOnMount />
      <div className="usa-card__header">
        <div>
          <div className="display-flex flex-align-center">
            <svg
              className="usa-icon text-base margin-left-neg-2px"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <use xlinkHref={iconSprite + "#arrow_back"}></use>
            </svg>
            <LinkWithQuery
              to={`/results/upload/submit/guide`}
              className="margin-left-05"
            >
              Bulk results upload guide
            </LinkWithQuery>
          </div>
          <div>
            <h1 className="font-sans-lg">Device code lookup</h1>
          </div>
        </div>
      </div>
      <div className="usa-card__body margin-top-1">
        <strong className="display-block margin-bottom-1em" id="select-device">
          Select device
        </strong>
        <div className="position-relative">
          <SearchInput
            onSearchClick={onSearchClick}
            onInputChange={onInputChange}
            queryString={debounced}
            placeholder={"Search for a device"}
            labeledBy="select-device"
            showSubmitButton={false}
          />
          <DeviceSearchResults
            items={searchDevices(deviceDisplayOptions, queryString)}
            setSelectedItem={setSelectedDevice}
            shouldShowSuggestions={showDropdown}
            loading={debounced !== queryString}
            queryString={queryString}
            dropDownRef={dropDownRef}
            multiSelect={false}
          />
          {selectedDevice && <DeviceDetails device={selectedDevice} />}
        </div>
      </div>
    </div>
  );
};

export default DeviceLookup;
