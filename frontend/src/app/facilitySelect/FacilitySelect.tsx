import React from "react";
import { useDispatch, useSelector, connect } from "react-redux";
import { useHistory } from "react-router-dom";

import Button from "../commonComponents/Button";
import { updateFacility } from "../store";
import { formatFullName } from "../utils/user";

import "./FacilitySelect.scss";

const FacilitySelect: React.FC<{}> = () => {
  const dispatch = useDispatch();

  const facilities = useSelector(
    (state) => (state as any).facilities as Facility[]
  );
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const user = useSelector((state) => (state as any).user as User);

  const history = useHistory();

  const setFacilityProp = (facilityId: string) => {
    history.push({ search: `?facility=${facilityId}` });
  };

  const setActiveFacility = (facility: Facility) => {
    dispatch(updateFacility(facility));
    setFacilityProp(facility.id);
  };

  if (facilities.length === 1) {
    setActiveFacility(facilities[0]);
    return <p>Loading facility information...</p>;
  }

  return (
    <main className="prime-home" id="facility-select">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <div>
                <h2>SimpleReport</h2>
                <div className="organization-name">{organization.name}</div>
              </div>
            </div>
            <div className="usa-card__body">
              <p className="welcome">Welcome, {formatFullName(user)}</p>
              <p className="select-text">
                Please select which facility you are working at today
              </p>
              {facilities.map((f) => (
                <Button
                  key={f.id}
                  onClick={() => setActiveFacility(f)}
                  variant="outline"
                >
                  {f.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default connect()(FacilitySelect);
