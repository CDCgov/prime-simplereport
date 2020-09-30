import React from "react";

class OrganizationView extends React.Component {
  static propTypes = {};

  render() {
    return (
      <main className="prime-home">
        <div class="grid-container">
          <h1>
            List of patients for organization with id{" "}
            {this.props.match.params.organizationId}{" "}
          </h1>
        </div>
      </main>
    );
  }
}

export default OrganizationView;
