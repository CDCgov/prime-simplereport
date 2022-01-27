package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.http.HttpStatus;

public class ConsoleApiAuditEvent {

  private final String requestId;
  private final HttpRequestDetails httpRequestDetails;
  private final int responseCode;
  private GraphQlInputs graphqlQueryDetails;
  private List<String> graphqlErrorPaths;
  private final ApiUser user;
  private Organization organization;
  private List<String> userPermissions;
  private boolean isAdminUser;
  private PatientLink patientLink;
  private JsonNode session;
  private static final String TYPE = "auditLog";

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
    this.requestId = requestId;
    this.httpRequestDetails = httpRequestDetails;
    this.graphqlQueryDetails = graphqlQueryDetails;
    this.graphqlErrorPaths = errorPaths;
    this.user = apiUser;
    this.organization = org;
    this.isAdminUser = isAdmin;
    this.userPermissions =
        permissions.stream().map(UserPermission::name).sorted().collect(Collectors.toList());
    this.responseCode = HttpStatus.SC_OK;
  }

  /** Constructor for REST (patient-experience) requests */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      int responseStatus,
      ApiUser user,
      Organization organization,
      PatientLink patientLink) {
    this.requestId = requestId;
    this.httpRequestDetails = httpRequestDetails;
    this.responseCode = responseStatus;
    this.user = user;
    this.organization = organization;
    this.patientLink = patientLink;
  }

  /** Constructor for anonymous REST requests. */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      int responseStatus,
      JsonNode userId,
      ApiUser user) {
    this.requestId = requestId;
    this.httpRequestDetails = httpRequestDetails;
    this.responseCode = responseStatus;
    this.session = userId;
    this.user = user;
  }

  public String getRequestId() {
    return requestId;
  }

  public HttpRequestDetails getHttpRequestDetails() {
    return httpRequestDetails;
  }

  public int getResponseCode() {
    return responseCode;
  }

  public GraphQlInputs getGraphqlQueryDetails() {
    return graphqlQueryDetails;
  }

  public List<String> getGraphqlErrorPaths() {
    return graphqlErrorPaths;
  }

  public List<String> getUserPermissions() {
    return userPermissions;
  }

  public ApiUser getUser() {
    return user;
  }

  public Organization getOrganization() {
    return organization;
  }

  public boolean isAdminUser() {
    return isAdminUser;
  }

  public PatientLink getPatientLink() {
    return patientLink;
  }

  public JsonNode getSession() {
    return session;
  }

  public String getType() {
    return TYPE;
  }
}
