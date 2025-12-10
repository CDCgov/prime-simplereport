package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The information that we capture about the graphQL API request for an audit event. Must be stable
 * (no type changes or field deletions) once released, since we will be using it to serialize
 * records.
 */
public class GraphQlInputs {

  private final String operationName;
  private final String query;

  @JsonSerialize(using = RequestVariablesSerializer.class)
  private final Map<String, Object> variables;

  @JsonCreator
  public GraphQlInputs(
      @JsonProperty("operationName") String operationName,
      @JsonProperty("query") String query,
      @JsonProperty("variables") Map<String, Object> variables) {
    this.operationName = operationName;
    this.query = query;
    this.variables = scrubPiiFromVariables(variables);
  }

  public String getOperationName() {
    return operationName;
  }

  public String getQuery() {
    return query;
  }

  public Map<String, Object> getVariables() {
    return variables;
  }

  private Map<String, Object> scrubPiiFromVariables(Map<String, Object> variables) {
    Map<String, Object> variablesWithoutPii = new HashMap<>(variables);

    piiJsonVariableNames.forEach(
        piiJsonVariable -> {
          variablesWithoutPii.replace(piiJsonVariable, "redacted");
        });

    return variablesWithoutPii;
  }

  private List<String> piiJsonVariableNames =
      new ArrayList<>(
          List.of(
              "name",
              "firstName",
              "middleName",
              "lastName",
              "suffix",
              "birthDate",
              "address",
              "street",
              "streetTwo",
              "city",
              "state",
              "zipCode",
              "telephone",
              "phoneNumbers",
              "role",
              "lookupId",
              "email",
              "emails",
              "county",
              "country",
              "race",
              "ethnicity",
              "tribalAffiliation",
              "gender",
              "genderIdentity",
              "residentCongregateSetting",
              "employedInHealthcare",
              "preferredLanguage",
              "testResultDelivery",
              "notes",
              "lastTest",
              "patient",
              "pregnancy",
              "syphilisHistory",
              "noSymptoms",
              "symptoms",
              "symptomOnset",
              "genderOfSexualPartners",
              "results",
              "patientLink",
              "surveyData",
              "testResult",
              "dateTested",
              "testOrder",
              "errors",
              "warnings",
              "message",
              "resultValue",
              "resultDate",
              "resultInterpretation",
              "answerList",
              "result",
              "testDetailsList"));
}
