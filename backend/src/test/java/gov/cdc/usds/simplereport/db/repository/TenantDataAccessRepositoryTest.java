package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TenantDataAccess;
import gov.cdc.usds.simplereport.db.model.auxiliary.PermissionsData;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.collections.CollectionUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TenantDataAccessRepositoryTest extends BaseRepositoryTest {

  @Autowired ApiUserRepository _apiUserRepo;
  @Autowired OrganizationRepository _orgRepo;

  @Autowired TenantDataAccessRepository _repo;

  @Test
  void createAndSave_success() {
    ApiUser apiUser =
        _apiUserRepo.save(
            new ApiUser("test@example.com", new PersonName("First", "Middle", "Last", "Suffix")));
    Organization org =
        _orgRepo.save(new Organization("Sample Org", "Sample Org Type", "Sample-Org", true));

    Set<String> authorities = new HashSet<>();
    authorities.add(
        TestUserIdentities.TEST_ROLE_PREFIX
            + TestUserIdentities.DEFAULT_ORGANIZATION
            + ":"
            + OrganizationRole.getDefault());
    authorities.add(
        TestUserIdentities.TEST_ROLE_PREFIX + TestUserIdentities.DEFAULT_ORGANIZATION + ":ADMIN");
    PermissionsData permissionsData = new PermissionsData(authorities);

    Date expiration = Date.from(Instant.now().plus(Duration.ofHours(1)));

    final String justification = "Using access to run tests";

    TenantDataAccess saved =
        _repo.save(new TenantDataAccess(apiUser, org, permissionsData, justification, expiration));

    assertEquals(apiUser.getLoginEmail(), saved.getGrantedToApiUser().getLoginEmail());
    assertEquals(org.getExternalId(), saved.getOrganization().getExternalId());
    assertTrue(
        CollectionUtils.isEqualCollection(
            authorities, saved.getPermissionsData().getAuthorities()));
    assertEquals(justification, saved.getJustification());
    assertFalse(saved.isExpired());

    List<TenantDataAccess> optRetrieved = _repo.findValidByApiUserId(apiUser.getInternalId());
    assertEquals(1, optRetrieved.size());
    TenantDataAccess retrieved = optRetrieved.get(0);

    assertEquals(apiUser.getLoginEmail(), retrieved.getGrantedToApiUser().getLoginEmail());
    assertEquals(org.getExternalId(), retrieved.getOrganization().getExternalId());
    assertTrue(
        CollectionUtils.isEqualCollection(
            authorities, retrieved.getPermissionsData().getAuthorities()));
    assertEquals(justification, retrieved.getJustification());
    assertFalse(retrieved.isExpired());
  }
}
