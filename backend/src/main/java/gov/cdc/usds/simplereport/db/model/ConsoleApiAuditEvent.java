package gov.cdc.usds.simplereport.db.model;

import static gov.cdc.usds.simplereport.api.model.filerow.FileRow.log;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.temporal.Temporal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.IdentityHashMap;
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
      Organization organization) {
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

    //    piiJsonVariableNames.forEach(
    //        piiJsonVariable -> variablesWithoutPii.replace(piiJsonVariable, "redacted"));

    return new GraphQlInputs(
        queryDetails.getOperationName(), queryDetails.getQuery(), variablesWithoutPii);
  }

  public Object redactPiiField(String variableName, Object variableValue, String replacement) {
    if (variableValue == null) return variableValue;

    Set<Object> visited = Collections.newSetFromMap(new IdentityHashMap<>());
    return depthFirstSearchRedact(variableName, variableValue, replacement, visited);
  }

  private Object depthFirstSearchRedact(
      String variableName, Object variableValue, String replacement, Set<Object> visited) {
    if (variableValue == null || visited.contains(variableValue)) {
      return variableValue;
    }
    visited.add(variableValue);

    // early return if match found, regardless of variableName's object type
    if (piiJsonVariableNames.contains(variableName)) {
      return replacement;
    }

    // Map
    if (variableValue instanceof Map<?, ?> map) {
      for (Object value : map.values()) {
        depthFirstSearchRedact(variableName, value, replacement, visited);
      }
      return variableValue;
    }

    // Iterable
    if (variableValue instanceof Iterable<?> iterable) {
      for (Object element : iterable) {
        depthFirstSearchRedact(variableName, element, replacement, visited);
      }
      return variableValue;
    }

    // Array
    if (variableValue.getClass().isArray()) {
      int length = java.lang.reflect.Array.getLength(variableValue);
      for (int i = 0; i < length; i++) {
        Object element = java.lang.reflect.Array.get(variableValue, i);
        depthFirstSearchRedact(variableName, element, replacement, visited);
      }
      return variableValue;
    }

    // Plain object
    if (isLeaf(variableValue)) {
      return variableValue;
    } else {
      Class<?> cls = variableValue.getClass();

      //      while (cls != null && cls != Object.class) {
      for (Field f : cls.getDeclaredFields()) {
        f.setAccessible(true);
        log.info("the CURRENT field name is: " + f.getName());
        try {
          //            if (piiJsonVariableNames.contains(f.getName()) && f.getType() ==
          // String.class) {
          //              f.set(variableValue, replacement); // e.g. "redacted"
          //            } else {
          Object child = f.get(variableValue);
          log.info("the CHILD field name is: " + child.getClass().getName());
          depthFirstSearchRedact(child.getClass().getName(), child, replacement, visited);
          //            }
        } catch (IllegalAccessException e) {
          // ignore or log
        }
        //        }
        //        cls = cls.getSuperclass();
      }
      return variableValue;
    }
  }

  /**
   * Treat "primitive-like" objects as leaves: don't recurse into them. This avoids reflecting into
   * things like String/Integer/UUID/etc.
   */
  private static boolean isLeaf(Object o) {
    //    Class<?> c = o.getClass();

    // common leaf types
    if (o instanceof String) return true;
    if (o instanceof Number) return true; // Integer, Long, BigDecimal, etc.
    if (o instanceof Boolean) return true;
    if (o instanceof Character) return true;
    if (o instanceof Enum<?>) return true;
    if (o instanceof UUID) return true;
    if (o instanceof Date) return true;
    if (o instanceof Temporal) return true; // java.time types
    if (o instanceof BigInteger) return true;
    if (o instanceof BigDecimal) return true;

    return false;
  }

  @JsonIgnore
  private final List<String> piiJsonVariableNames =
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
