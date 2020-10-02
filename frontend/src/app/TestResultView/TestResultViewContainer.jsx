import React from "react";
import { getTestResult } from "../../query/tests";
import TestResultView from "./TestResultView";

class TestResultViewContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      testResults: [],
    };
  }

  componentDidMount = async () => {
    try {
      let testRegistrationId = this.props.match.params.testRegistrationId;
      const testResult = await getTestResult(testRegistrationId);
      this.setState({
        ...this.state,
        testResult,
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  render() {
    return (
      <TestResultView
        testResults={this.state.testResult} // TODO: separate out testRegistration from testResult
      />
    );
  }
}

export default TestResultViewContainer;
