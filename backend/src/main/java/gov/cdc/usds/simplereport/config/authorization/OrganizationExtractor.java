package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import java.util.Arrays;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

// Note: will be renaming `OrganizationRoleClaims` in a PR soon, and will change this class name to
// mimic that
@Component
@Slf4j
public class OrganizationExtractor
    implements Converter<Collection<? extends GrantedAuthority>, List<OrganizationRoleClaims>> {

  public static final String FACILITY_ACCESS_MARKER = "FACILITY_ACCESS";
  private static final String CLAIM_SEPARATOR = ":";
  private AuthorizationProperties properties;

  public OrganizationExtractor(AuthorizationProperties properties) {
    this.properties = properties;
  }

  /**
   * There are two kinds of claims we care about - role claims and facility claims. Role claims take
   * the format SR-<ENV>-TENANT:<ORG_EXTERNAL_ID>:<ROLE> Facility claims take the format
   * SR-<ENV>-TENANT:<ORG_EXTERNAL_ID>:FACILITY_ACCESS:<FACILITY_UUID>
   */
  public List<OrganizationRoleClaims> convertClaims(Collection<String> claims) {
    // Map of orgs to facilities the user can access therein
    Map<String, Set<UUID>> facilitiesFound = new HashMap<>();
    // Map of orgs to roles the user has therein
    Map<String, EnumSet<OrganizationRole>> rolesFound = new HashMap<>();
    for (String claimed : claims) {
      try {
        if (!claimed.startsWith(properties.getRolePrefix())) {
          continue;
        }
        if (claimed.contains(FACILITY_ACCESS_MARKER)) {
          int facilityOffset = claimed.lastIndexOf(CLAIM_SEPARATOR);
          String claimedFacility = claimed.substring(facilityOffset + CLAIM_SEPARATOR.length());
          int facilityMarkerOffset = claimed.lastIndexOf(CLAIM_SEPARATOR + FACILITY_ACCESS_MARKER);
          String claimedOrg =
              claimed.substring(properties.getRolePrefix().length(), facilityMarkerOffset);
          try {
            UUID claimedFacilityValidated = UUID.fromString(claimedFacility);
            Set<UUID> existingFacilities = facilitiesFound.get(claimedOrg);
            if (existingFacilities == null) {
              facilitiesFound.put(
                  claimedOrg, new HashSet<>(Arrays.asList(claimedFacilityValidated)));
            } else {
              existingFacilities.add(claimedFacilityValidated);
            }
          } catch (IllegalArgumentException e) {
            log.warn("Invalid facility_id={} for organization={}", claimedFacility, claimedOrg);
          }
        } else {
          int roleOffset = claimed.lastIndexOf(CLAIM_SEPARATOR);
          String claimedOrg = claimed.substring(properties.getRolePrefix().length(), roleOffset);
          String claimedRole =
              claimed.substring(
                  roleOffset + CLAIM_SEPARATOR.length()); // the separator is part of neither string
          try {
            OrganizationRole claimedRoleValidated = OrganizationRole.valueOf(claimedRole);
            EnumSet<OrganizationRole> existingRoles = rolesFound.get(claimedOrg);
            if (existingRoles == null) {
              rolesFound.put(claimedOrg, EnumSet.of(claimedRoleValidated));
            } else {
              existingRoles.add(claimedRoleValidated);
            }
          } catch (IllegalArgumentException e) {
            log.warn("Unexpected role_constant={}", claimedRole);
          }
        }
      } catch (IndexOutOfBoundsException e) {
        log.error("Cannot process unexpected claim={}", claimed);
      }
    }
    if (facilitiesFound.isEmpty()
        && rolesFound.entrySet().stream()
            .noneMatch(e -> PermissionHolder.grantsAllFacilityAccess(e.getValue()))) {
      log.error("No tenant organization facilities found!");
    }
    if (rolesFound.isEmpty()) {
      log.error("No tenant organization roles found!");
    }
    Set<String> orgsFound = new HashSet<>();
    orgsFound.addAll(facilitiesFound.keySet());
    orgsFound.addAll(rolesFound.keySet());
    return orgsFound.stream()
        .map(
            o ->
                new OrganizationRoleClaims(
                    o,
                    facilitiesFound.getOrDefault(o, Set.of()),
                    rolesFound.getOrDefault(o, EnumSet.noneOf(OrganizationRole.class))))
        .collect(Collectors.toList());
  }

  @Override
  public List<OrganizationRoleClaims> convert(Collection<? extends GrantedAuthority> source) {
    return convertClaims(
        source.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
  }
}
