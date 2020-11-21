import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../commonComponents/Button";
import { v4 as uuidv4 } from "uuid";
// import useUniqueId from "../commonComponents/useUniqueIds";  // todo: switch to using
import useCustomForm from "../commonHooks/FormHook";

// todo: sanitize input somewhere central.
const MAX_FIELD_LEN = 64;

// todo: move somewhere central. These are roles as defined in the database.
export const ROLE_TYPES = {
  ADMIN: "ADMIN",
  TESTING: "TESTING",
  INTAKE: "INTAKE",
};

// todo: replace with something localizable
const roleToString = (roleType) => {
  return (
    {
      [ROLE_TYPES.ADMIN]: "Admin",
      [ROLE_TYPES.TESTING]: "Testing",
      [ROLE_TYPES.INTAKE]: "Intake",
    }[roleType] || ""
  );
};

/**
 * @param orgSettings {object}
 * @param updateOrgSettings {function}
 * @returns {JSX.Element}
 * @constructor
 */
const StaffSettings = ({ orgSettings, updateOrgSettings }) => {
  const [copyStaffSettings, setCopyStaffSettings] = useState(
    { ...orgSettings.staff } || {}
  );

  const saveLocalCopyBackTopParent = () => {
    // we don't want private fields
    const staff = {};
    Object.entries(copyStaffSettings).forEach(([key, value]) => {
      staff[key] = {
        name: value.name.substring(0, MAX_FIELD_LEN),
        email: value.email.substring(0, MAX_FIELD_LEN),
        role: value.role.substring(0, 50), // todo: restrict to valid strings
      };
    });
    updateOrgSettings({ ...orgSettings, staff });
  };

  const onStaffAddNew = () => {
    // Create a new entry in the copy settings
    // we save the entry out of the copy and into actual settings on save event
    let newStaffId = `staff-${uuidv4()}`;

    setCopyStaffSettings({
      ...copyStaffSettings,
      [newStaffId]: {
        name: "",
        email: "",
        role: ROLE_TYPES.INTAKE,
        _editable: true,
      },
    });
  };

  const onStaffEditStart = (staffkey) => {
    // This approach to changing _editable forces the entry to rerender
    const staffentry = copyStaffSettings[staffkey];
    setCopyStaffSettings({
      ...copyStaffSettings,
      [staffkey]: { ...staffentry, _editable: true },
    });
  };

  const onStaffUpdate = ({ staffkey, staffentry }) => {
    copyStaffSettings[staffkey] = { ...staffentry };
    setCopyStaffSettings(copyStaffSettings);
  };

  const onStaffSave = ({ staffkey, staffentry }) => {
    setCopyStaffSettings({
      ...copyStaffSettings,
      [staffkey]: { ...staffentry, _editable: false },
    });
    saveLocalCopyBackTopParent();
  };

  const onStaffRemove = (staffkey) => {
    // remove entry from ui copy
    delete copyStaffSettings[staffkey];
    setCopyStaffSettings(copyStaffSettings);
    saveLocalCopyBackTopParent();
  };

  const StaffRowComponent = ({ initialValues }) => {
    const staffkey = initialValues.staffkey; // ID elements should NOT regen across data update
    const { values, handleChange, handleBlur, handleSubmit } = useCustomForm({
      initialValues,
      onSubmit: (valuesAndErrors) =>
        onStaffSave({
          staffkey: valuesAndErrors.values.staffkey,
          staffentry: {
            name: valuesAndErrors.values.name,
            email: valuesAndErrors.values.email,
            role: valuesAndErrors.values.role,
          },
        }),
    });

    const persistOnBlur = (event) => {
      onStaffUpdate({
        staffkey: values.staffkey,
        staffentry: {
          name: values.name,
          email: values.email,
          role: values.role,
          _editable: true,
        },
      });
      handleBlur(event);
    };

    // cannot use <Dropdown> or <TextInput> because they do
    // not play well with the FormHook component. We need a standard form
    // across the project
    return (
      <React.Fragment>
        {values._editable ? (
          <div
            className="grid-row grid-gap-lg mobile-lg:border-bottom-1px"
            key={values.staffkey}
          >
            <div className="tablet:grid-col minw-15">
              <label className="usa-label" htmlFor={`${staffkey}_name`}>
                Name (required)
              </label>
              <input
                type="text"
                id={`${staffkey}_name`}
                name="name"
                defaultValue={values.name}
                className="usa-input"
                required={true}
                onChange={handleChange}
                onBlur={persistOnBlur}
                maxLength={MAX_FIELD_LEN}
              />
            </div>
            <div className="tablet:grid-col minw-15">
              <label className="usa-label" htmlFor={`${staffkey}_email`}>
                Email (required)
              </label>
              <input
                type="email"
                name="email"
                id={`${staffkey}_email`}
                defaultValue={values.email}
                className="usa-input"
                required={true}
                onChange={handleChange}
                maxLength={MAX_FIELD_LEN}
                onBlur={persistOnBlur}
                pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
              />
            </div>
            <div className="tablet:grid-col">
              <label className="usa-label" htmlFor={`${staffkey}_role`}>
                Role
              </label>
              <select
                className="usa-select"
                name="role"
                id={`${staffkey}_role`}
                onChange={handleChange}
                value={values.role}
                onBlur={persistOnBlur}
              >
                {Object.entries(ROLE_TYPES).map(([key], i) => (
                  <option value={key} key={key + i}>
                    {" "}
                    {roleToString(key)}
                  </option>
                ))}
              </select>
            </div>

            <div className="tablet:grid-col-auto ">
              <label className="usa-label" htmlFor={`${staffkey}_actions`}>
                &nbsp;
              </label>
              <div
                aria-label="Actions"
                className="usa-button-group"
                id={`${staffkey}_actions`}
              >
                <Button
                  onClick={handleSubmit}
                  icon="save"
                  title="save"
                  type={"submit"}
                  addClass="usa-button-group__item"
                />
                <Button
                  onClick={() => onStaffRemove(values.staffkey)}
                  icon="trash"
                  title="trash"
                  addClass="usa-button-group__item usa-button--outline prime-red-icon"
                >
                  <span hidden>Delete</span>
                  <FontAwesomeIcon icon="trash" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="grid-row mobile-lg:border-bottom-1px"
            key={values.staffkey}
          >
            <div className="tablet:grid-col minw-15 prime-staff-user-list-item">
              <b>Name: </b>
              <span className="padding-1 prime-no-wrap">{values.name}</span>
            </div>
            <div className="tablet:grid-col minw-15 prime-staff-user-list-item">
              <b>Email: </b>
              <span className="padding-1 prime-no-wrap">{values.email}</span>
            </div>
            <div className="tablet:grid-col minw-15 prime-staff-user-list-item">
              <b>Role: </b>
              <span className="padding-1 prime-no-wrap">
                {roleToString(values.role)}
              </span>
            </div>
            <div className="tablet:grid-col-auto prime-staff-user-list-item">
              <div aria-label="Actions" className="usa-button-group">
                <Button
                  onClick={() => onStaffEditStart(values.staffkey)}
                  icon="edit"
                  title="edit"
                  addClass="usa-button-group__item usa-button--outline"
                />
                <Button
                  onClick={() => onStaffRemove(values.staffkey)}
                  icon="trash"
                  title="trash"
                  addClass="usa-button-group__item usa-button--outline prime-red-icon"
                >
                  <span hidden>Delete</span>
                  <FontAwesomeIcon icon="trash" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  // const StaffRow = useMemo(StaffRowComponent);

  const generateStaffRows = () => {
    return Object.entries(
      copyStaffSettings || {}
    ).map(([staffkey, staffentry]) => (
      <StaffRowComponent
        key={staffkey}
        initialValues={{ staffkey, ...staffentry }}
        editable={staffentry._editable}
      />
    ));
  };

  const renderStaffTable = () => {
    if (Object.keys(copyStaffSettings || {}).length === 0) {
      return <p> There are currently no users </p>;
    }
    return generateStaffRows();
  };

  return (
    <div className="grid-container">
      <div className="grid-row">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h3> Manage Staff Users</h3>
          </div>
          <div className="usa-card__body">{renderStaffTable()}</div>
          <div className="usa-card__footer">
            <Button
              onClick={onStaffAddNew}
              type="submit"
              outline
              label="Add New Staff"
              icon="plus"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSettings;
