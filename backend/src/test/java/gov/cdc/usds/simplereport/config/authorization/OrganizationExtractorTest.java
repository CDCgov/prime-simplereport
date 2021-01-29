package gov.cdc.usds.simplereport.config.authorization;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;

class OrganizationExtractorTest {

    private static final AuthorizationProperties MOCK_PROPS = new AuthorizationProperties(null, "SR-UNITTEST-TENANT:");

    @Test
    void convert_emptyList_emptyReturn() {
        assertEquals(0, convert(Collections.emptyList()).size());
    }

    @Test
    void convert_noRelevantAuthorities_emptyReturn() {
        List<AuthorityBasedOrganizationRoles> converted = convert(
                Arrays.asList(new SimpleGrantedAuthority("SUPERUSER"),
                        new SimpleGrantedAuthority("SR-PROD-TENANT:FOOBAR:USER")));
        assertEquals(0, converted.size());
    }

    @Test
    void convert_onlyInvalidAuthorities_emptyReturn() {
        List<AuthorityBasedOrganizationRoles> converted = convert(
                Arrays.asList(new SimpleGrantedAuthority("SUPERUSER"),
                        new SimpleGrantedAuthority("SR-UNITTEST-TENANT:FOOBAR:FROBOBNITZ")));
        assertEquals(0, converted.size());
    }

    @Test
    void convert_oneRelevantAuthority_singleReturn() {
        List<AuthorityBasedOrganizationRoles> converted = convert(
                Arrays.asList(new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                        new SimpleGrantedAuthority("SR-PROD-TENANT:FOOBAR:USER")));
        assertEquals(1, converted.size());
        assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
        assertEquals(Collections.singleton(OrganizationRole.USER), converted.get(0).getGrantedRoles());
    }

    @Test
    void convert_twoRelevantAuthoritiesOneOrg_singleReturn() {
        List<AuthorityBasedOrganizationRoles> converted = convert(Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:ADMIN")));
        assertEquals(1, converted.size());
        assertEquals("MYNIFTYORG", converted.get(0).getOrganizationExternalId());
        assertEquals(Set.of(OrganizationRole.USER, OrganizationRole.ADMIN), converted.get(0).getGrantedRoles());
    }

    @Test
    void convert_multipleOrgAuthorities_multipleReturn() {
        List<AuthorityBasedOrganizationRoles> converted = convert(Arrays.asList(
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:MYNIFTYORG:USER"),
                new SimpleGrantedAuthority("SR-UNITTEST-TENANT:YOURNIFTYORG:USER")));
        assertEquals(2, converted.size());
        assertEquals(Set.of("MYNIFTYORG", "YOURNIFTYORG"),
                converted.stream().map(AuthorityBasedOrganizationRoles::getOrganizationExternalId).collect(Collectors.toSet()));
        assertEquals(Set.of(OrganizationRole.USER), converted.get(0).getGrantedRoles());
        assertEquals(Set.of(OrganizationRole.USER), converted.get(1).getGrantedRoles());
    }

    private List<AuthorityBasedOrganizationRoles> convert(List<GrantedAuthority> authorities) {
        return new OrganizationExtractor(MOCK_PROPS).convert(authorities);
    }
}
