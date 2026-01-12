package gov.cdc.usds.simplereport.db.model;

import static gov.cdc.usds.simplereport.api.model.filerow.FileRow.log;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.time.temporal.Temporal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.Getter;
import org.apache.http.HttpStatus;

@Getter
public class ConsoleApiAuditEvent {
  private final String type = "auditLog";
  private HttpRequestDetails httpRequestDetails;
  private GraphQlInputs graphqlQueryDetails;
  private List<String> graphqlErrorPaths;
  private List<String> userPermissions;
  private Organization organization;
  private PatientLink patientLink;
  private String requestId;
  private int responseCode;
  private boolean isAdminUser;
  private ApiUser user;
  private JsonNode session;

  public ConsoleApiAuditEvent() {}

  /** Constructor for graphql requests */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      GraphQlInputs graphqlQueryDetails,
      List<String> errorPaths,
      ApiUser apiUser,
      List<UserPermission> permissions,
      boolean isAdmin,
      Organization org) {
    this.responseCode = HttpStatus.SC_OK;
    this.graphqlQueryDetails = scrubPiiFromQueryDetails(graphqlQueryDetails);
    this.graphqlErrorPaths = errorPaths;
    this.userPermissions =
        permissions.stream().map(UserPermission::name).sorted().collect(Collectors.toList());
    this.isAdminUser = isAdmin;
    this.organization = org;
    this.httpRequestDetails = httpRequestDetails;
    this.requestId = requestId;
    this.user = apiUser;
  }

  /** Constructor for REST (patient-experience) requests */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      int responseStatus,
      ApiUser user,
      Organization organization,
      PatientLink patientLink) {
    this.patientLink = patientLink;
    this.organization = organization;
    this.user = user;
    this.responseCode = responseStatus;
    this.httpRequestDetails = httpRequestDetails;
    this.requestId = requestId;
  }

  /** Constructor for anonymous REST requests. */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      int responseStatus,
      JsonNode userId,
      ApiUser user) {
    this.user = user;
    this.session = userId;
    this.responseCode = responseStatus;
    this.httpRequestDetails = httpRequestDetails;
    this.requestId = requestId;
  }

  private GraphQlInputs scrubPiiFromQueryDetails(GraphQlInputs queryDetails) {
    Map<String, Object> variablesWithoutPii = new HashMap<>(queryDetails.getVariables());
    variablesWithoutPii.replaceAll((key, value) -> redactPiiField(key, value, "redacted"));

    return new GraphQlInputs(
        queryDetails.getOperationName(), queryDetails.getQuery(), variablesWithoutPii);
  }

  public Object redactPiiField(String variableName, Object variableValue, String replacement) {
    if (variableValue == null) return variableValue;

    Set<Object> visited = new HashSet<>();
    Set<Object> redacted = new HashSet<>();
    return depthFirstSearchRedact(variableName, variableValue, replacement, visited, redacted);
  }

  private Object depthFirstSearchRedact(
      String variableName,
      Object variableValue,
      String replacement,
      Set<Object> visited,
      Set<Object> redacted) {
    // scenario like multiplex, for example, where you can have the variableValue of "POSITIVE"
    // visited and redacted for one disease but also need it redacted for any "POSITIVE" subsequent
    // disease results. Checking against the "visited" Set prior to this check would make it so any
    // subsequent "POSITIVE" variableValues are not redacted.
    if (redacted.contains(variableValue)) {
      return replacement;
    }

    if (variableValue == null || visited.contains(variableValue)) {
      return variableValue;
    }
    visited.add(variableValue);

    // early return if match found, ignoring variableValue's object type
    if (piiJsonVariableNames.contains(variableName)) {
      redacted.add(variableValue);
      return replacement;
    }

    // Map
    if (variableValue instanceof Map<?, ?> rawMap) {
      Map<Object, Object> map = (Map<Object, Object>) rawMap;
      for (Map.Entry<Object, Object> entry : map.entrySet()) {
        String nestedVariableName = entry.getKey().toString();
        Object nestedVariableValue = entry.getValue();
        Object redactedEntryValue =
            depthFirstSearchRedact(
                nestedVariableName, nestedVariableValue, replacement, visited, redacted);
        entry.setValue(redactedEntryValue);
      }
      return variableValue;
    }

    // Iterable
    if (variableValue instanceof Iterable<?> iterable) {
      for (Object element : iterable) {
        depthFirstSearchRedact(
            element.getClass().getName(), element, replacement, visited, redacted);
      }
      return variableValue;
    }

    // Array
    if (variableValue.getClass().isArray()) {
      if (variableValue.getClass().getComponentType().isPrimitive()) {
        return variableValue; // Can't put a String replacement in to a primitive int array, for
        // example. Rely on the variableName for redacting the whole array
        // instead of modifying the primitive values within the array
      }

      int length = Array.getLength(variableValue);
      for (int i = 0; i < length; i++) {
        Object element = Array.get(variableValue, i);
        Object redactedElement =
            depthFirstSearchRedact(
                variableName + "[" + i + "]", element, replacement, visited, redacted);

        Array.set(variableValue, i, redactedElement);
      }

      return variableValue;
    }

    // Plain object
    if (isLeaf(variableValue)) {
      return variableValue;
    } else {
      Class<?> cls = variableValue.getClass();
      for (Field f : cls.getDeclaredFields()) {
        f.setAccessible(true);
        try {
          Object child = f.get(variableValue);
          depthFirstSearchRedact(child.getClass().getName(), child, replacement, visited, redacted);
        } catch (IllegalAccessException e) {
          log.info(e.getMessage());
        }
      }
      return variableValue;
    }
  }

  /**
   * Treat "primitive-like" objects as leaves: don't recurse into them. This avoids reflecting into
   * basic classes like String/Integer/UUID/etc. that have fields we don't need to look at.
   */
  private static boolean isLeaf(Object o) {

    // common leaf types
    if (o instanceof String) return true;
    if (o instanceof Number) return true; // Integer, Long, BigDecimal, etc.
    if (o instanceof Boolean) return true;
    if (o instanceof Character) return true;
    if (o instanceof Enum<?>) return true;
    if (o instanceof UUID) return true;
    if (o instanceof Date) return true;
    if (o instanceof Temporal) return true; // java.time types

    return false;
  }

  @JsonIgnore
  private final List<String> piiJsonVariableNames =
      // these are taken from pii-containing field names in main.graphqls
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
              "notes",
              "patient",
              "pregnancy",
              "syphilisHistory",
              "noSymptoms",
              "symptoms",
              "symptomOnset",
              "genderOfSexualPartners",
              "surveyData",
              "disease",
              "diseaseName",
              "testResult", // needed for MultiplexResult and MultiplexResultInput graphql types.
              // "testResult" there is a String that defines the actual outcome of a
              // test e.g. positive/negative
              "errors",
              "warnings",
              "message",
              "resultValue",
              "resultInterpretation",
              "answerList",
              "result" // used in testResultsPage graphql and others
              ));
}
