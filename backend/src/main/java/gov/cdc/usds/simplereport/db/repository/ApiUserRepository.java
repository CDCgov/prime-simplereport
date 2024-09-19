package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

/** Interface specification for fetching and manipulating {@link ApiUser} entities */
public interface ApiUserRepository extends EternalSystemManagedEntityRepository<ApiUser> {

  String NAME_ORDER =
      " order by e.nameInfo.lastName, e.nameInfo.firstName, e.nameInfo.middleName, e.internalId";
  String API_USER_ROLE_LEFT_JOIN = " LEFT JOIN api_user_role aur ON aur.apiUser = e";
  String BY_ORG_AND_UNDELETED_USER = " WHERE aur.organization = :org AND e.isDeleted = false";

  // Defining this method explicitly means that findById() will not be able to find soft-deleted
  // users,
  // rendering un-deletion near-impossible
  @Query(BASE_QUERY + " and internalId = :id")
  Optional<ApiUser> findById(UUID id);

  @Query("FROM #{#entityName} e WHERE internalId = :id")
  Optional<ApiUser> findByIdIncludeArchived(UUID id);

  @Query(BASE_QUERY + " and loginEmail = :email")
  Optional<ApiUser> findByLoginEmail(String email);

  @Query("FROM #{#entityName} e WHERE lower(loginEmail) = lower(:email)")
  Optional<ApiUser> findByLoginEmailIncludeArchived(String email);

  @Query(BASE_QUERY + " and loginEmail IN :emails" + NAME_ORDER)
  List<ApiUser> findAllByLoginEmailInOrderByName(Collection<String> emails);

  @Query(
      value =
          "from #{#entityName} e"
              + API_USER_ROLE_LEFT_JOIN
              + BY_ORG_AND_UNDELETED_USER
              + NAME_ORDER)
  List<ApiUser> findAllByOrganization(Organization org);

  @Query(
      value =
          "from #{#entityName} e"
              + API_USER_ROLE_LEFT_JOIN
              + BY_ORG_AND_UNDELETED_USER
              + " AND aur.role = :role"
              + NAME_ORDER)
  List<ApiUser> findAllByOrganizationAndRole(Organization org, OrganizationRole role);

  @Query(
      value =
          "from #{#entityName} e"
              + API_USER_ROLE_LEFT_JOIN
              + " LEFT JOIN api_user_facility auf ON auf.apiUser = e"
              + " WHERE auf.facility = :facility"
              + " AND e.isDeleted = false"
              + " AND aur.role IN :roles"
              + " GROUP BY e")
  List<ApiUser> findAllByFacilityAndRoles(Facility facility, Collection<OrganizationRole> roles);
}
