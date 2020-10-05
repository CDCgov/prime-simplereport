import React from "react";
import { getTestResult } from "../../query/testRegistrations";
import TestResultView from "./TestResultView";

class TestResultViewContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      testResult: null,
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
    console.log("TRVS state", this.state);
    return <TestResultView testResults={this.state.testResult} />;
  }
}

export default TestResultViewContainer;
