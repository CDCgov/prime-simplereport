import React from "react";
import PropTypes from "prop-types";
import uniqueId from "react-html-id";

class TextInput extends React.Component {
  constructor() {
    super();
    uniqueId.enableUniqueIds(this);
  }

  static propTypes = {
    value: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <React.Fragment>
        <label className="usa-label" htmlFor={this.nextUniqueId()}>
          {this.props.label}
        </label>
        <input
          className="usa-input"
          id={this.lastUniqueId()}
          name={this.props.name}
          type="text"
          onChange={this.props.onChange}
        >
          {this.props.value}
        </input>
      </React.Fragment>
    );
  }
}

export default TextInput;
