package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.array.ListArrayType;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Parameter;
import org.hibernate.annotations.Type;

/**
 * Model to meet the following specification:
 *
 * <h3>AU-3</h3>
 *
 * We will capture in our database, for each API request by an authenticated user, the following
 * data:
 *
 * <ol>
 *   <li>the rest endpoint or graphql query, with parameters
 *   <li>the identity of the user making the request
 *   <li>the permissions applicable to that user when they made the request
 *   <li>the identity of the tenant organization whose data was being queried or altered
 *   <li>whether the action was permitted or was denied
 *   <li>the origin of the HTTP request
 *   <li>the date and time of the request
 * </ol>
 *
 * This class exists outside of the normal entity structure of the application, so it does not
 * extend any base classes, but it does still use Hibernate interceptors to set the primary key ID
 * and the creation timestamp, so that we don't have <i>three</i> ways of doing that in one package.
 */
@Entity
@Immutable
public class ApiAuditEvent {

  // NOTE: you may wonder why fields are not marked "final" on an immutable object. This is because
  // of the way Hibernate fills in objects when they are loaded from the database: we need a no-arg
  // default constructor, and hence cannot have final fields.
  /** The primary key for the log entry, which can certainly be a random UUID */
  @Id
  @Column
  @GeneratedValue(generator = "UUID4")
  private UUID id;

  /**
   * The timestamp for the log event creation (this is likely the *end* of request processing, so
   * trying to match on may get dicey, and we may need to add another field for that.
   */
  @Column(updatable = false)
  @Temporal(TemporalType.TIMESTAMP)
  @CreationTimestamp
  private Date eventTimestamp;

  /** The correlation ID from server logs */
  @Column private String requestId;

  @Column
  @Type(type = "jsonb")
  private HttpRequestDetails httpRequestDetails;

  @Column private int responseCode;

  @Column
  @Type(type = "jsonb")
  private GraphQlInputs graphqlQueryDetails;

  @Column
  @Type(type = "list-array")
  private List<String> graphqlErrorPaths;

  @ManyToOne(optional = true)
  @JoinColumn(name = "api_user_id")
  private ApiUser user;

  @ManyToOne(optional = true)
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Column
  @Type(
      type = "list-array",
      parameters = {@Parameter(name = ListArrayType.SQL_ARRAY_TYPE, value = "text")})
  private List<String> userPermissions;

  @Column private boolean isAdminUser; // don't love this but it is actually pretty specific

  @ManyToOne(optional = true)
  @JoinColumn(name = "patient_link_id")
  private PatientLink patientLink;

  @Column(nullable = true)
  @Type(type = "jsonb")
  private JsonNode session;

  protected ApiAuditEvent() {
    // hibernate
  }

  /** Constructor for graphql requests */
  @SuppressWarnings("checkstyle:MagicNumber") // seriously not importing HttpStatus for this
  public ApiAuditEvent(
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
    this.responseCode = 200;
  }

  /** Constructor for REST (patient-experience) requests */
  public ApiAuditEvent(
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
  public ApiAuditEvent(
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

  public UUID getId() {
    return id;
  }

  public Date getEventTimestamp() {
    return eventTimestamp;
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
}
