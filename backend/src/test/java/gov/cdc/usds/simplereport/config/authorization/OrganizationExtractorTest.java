package gov.cdc.usds.simplereport.config.authorization;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class OrganizationExtractorTest {

  private static final AuthorizationProperties MOCK_PROPS =
      new AuthorizationProperties(null, "UNITTEST");

  @Test
  void convert_emptyList_emptyReturn() {
    assertEquals(0, convert(Collections.emptyList()).size());
  }

  @Test
  void convert_noRelevantAuthorities_emptyReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SUPERUSER"),
                new SimpleGrantedAuthority("SR-PROD-TENANT:FOOBAR:USER")));
    assertEquals(0, converted.size());
  }

  @Test
  void convert_onlyInvalidAuthorities_emptyReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SUPERUSER"),
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:FOOBAR:FROBOBNITZ"),
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:FOOBAR:FACILITY_ACCESS:BAZ")));
    assertEquals(0, converted.size());
  }

  @Test
  void convert_oneRelevantAuthority_singleReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                new SimpleGrantedAuthority("SR-PROD-TENANT:FOOBAR:USER")));
    assertEquals(1, converted.size());
    assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
    assertEquals(Collections.singleton(OrganizationRole.USER), converted.get(0).getGrantedRoles());
  }

  @Test
  void convert_fourRelevantAuthoritiesOneOrg_singleReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:ENTRY_ONLY"),
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:f49e8e27-dd41-4a9e-a29f-15ac74422923")));
    assertEquals(1, converted.size());
    assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
    assertEquals(
        Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY),
        converted.get(0).getGrantedRoles());
    assertEquals(
        Set.of(
            UUID.fromString("80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
            UUID.fromString("f49e8e27-dd41-4a9e-a29f-15ac74422923")),
        converted.get(0).getFacilities());
  }

  @Test
  void convert_twoRelevantAuthoritiesOneOrgRolesOnly_singleReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:ENTRY_ONLY")));
    assertEquals(1, converted.size());
    assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
    assertEquals(
        Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY),
        converted.get(0).getGrantedRoles());
    assertEquals(Set.of(), converted.get(0).getFacilities());
  }

  @Test
  void convert_twoRelevantAuthoritiesOneOrgFacilitiesOnly_singleReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:f49e8e27-dd41-4a9e-a29f-15ac74422923")));
    assertEquals(1, converted.size());
    assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
    assertEquals(Set.of(), converted.get(0).getGrantedRoles());
    assertEquals(
        Set.of(
            UUID.fromString("80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
            UUID.fromString("f49e8e27-dd41-4a9e-a29f-15ac74422923")),
        converted.get(0).getFacilities());
  }

  @Test
  void convert_fourRelevantAuthoritiesOneOrgAllFacilityAccess_singleReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                // ADMIN claim confers all-facility access
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:ADMIN"),
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:f49e8e27-dd41-4a9e-a29f-15ac74422923")));
    assertEquals(1, converted.size());
    assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
    assertEquals(
        Set.of(OrganizationRole.USER, OrganizationRole.ADMIN), converted.get(0).getGrantedRoles());
    assertEquals(
        Set.of(
            UUID.fromString("80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
            UUID.fromString("f49e8e27-dd41-4a9e-a29f-15ac74422923")),
        converted.get(0).getFacilities());
  }

  @Test
  void convert_multipleOrgAuthorities_multipleReturn() {
    List<OrganizationRoleClaims> converted =
        convert(
            Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                new SimpleGrantedAuthority(
                    "SR-UNITTEST-TENANT:YOURNIFTYORG:FACILITY_ACCESS:80d0c820-1dc5-418e-a61e-dc6dad8c5e49")));
    assertEquals(2, converted.size());
    assertTrue(
        converted.stream()
            .anyMatch(
                c ->
                    c.getOrganizationExternalId().equals("MYNIFTYORG")
                        && c.getGrantedRoles().equals(Set.of(OrganizationRole.USER))
                        && c.getFacilities().equals(Set.of())));
    assertTrue(
        converted.stream()
            .anyMatch(
                c ->
                    c.getOrganizationExternalId().equals("YOURNIFTYORG")
                        && c.getGrantedRoles().equals(Set.of())
                        && c.getFacilities()
                            .equals(
                                Set.of(UUID.fromString("80d0c820-1dc5-418e-a61e-dc6dad8c5e49")))));
  }

  private List<OrganizationRoleClaims> convert(List<GrantedAuthority> authorities) {
    return new OrganizationExtractor(MOCK_PROPS).convert(authorities);
  }
}
