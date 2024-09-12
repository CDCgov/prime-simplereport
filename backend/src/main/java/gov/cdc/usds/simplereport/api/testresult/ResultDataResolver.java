package gov.cdc.usds.simplereport.api.testresult;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResolvedSurveyData;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultsListItem;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ResultDataResolver {

  @SchemaMapping(typeName = "Result", field = "facility")
  public ApiFacility getFacility(TestResultsListItem result) {
    return new ApiFacility(result.getFacility());
  }

  @SchemaMapping(typeName = "Result", field = "surveyData")
  public ResolvedSurveyData getSurveyData(TestResultsListItem result) {
    return new ResolvedSurveyData(result.getSurveyData());
  }
}
