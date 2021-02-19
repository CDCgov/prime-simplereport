package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimen;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.model.DeviceTypeHolder;

@Service
@Transactional(readOnly = true)
public class OrganizationService {

    private static final Logger LOG = LoggerFactory.getLogger(OrganizationService.class);

    private OrganizationRepository _repo;
    private FacilityRepository _facilityRepo;
    private ProviderRepository _providerRepo;
    private AuthorizationService _authService;
    private OktaRepository _oktaRepo;

    public OrganizationService(OrganizationRepository repo,
            FacilityRepository facilityRepo,
            AuthorizationService authService,
            ProviderRepository providerRepo,
            OktaRepository oktaRepo) {
        _repo = repo;
        _facilityRepo = facilityRepo;
        _authService = authService;
        _providerRepo = providerRepo;
        _oktaRepo = oktaRepo;
    }

    public Optional<OrganizationRoles> getCurrentOrganizationRoles() {
        List<OrganizationRoleClaims> orgRoles = _authService.findAllOrganizationRoles();
        List<String> candidateExternalIds = orgRoles.stream()
                .map(OrganizationRoleClaims::getOrganizationExternalId)
                .collect(Collectors.toList());
        List<Organization> validOrgs = _repo.findAllByExternalId(candidateExternalIds);
        if (validOrgs == null || validOrgs.size() != 1) {
            int numOrgs = (validOrgs == null) ? 0
                                              : validOrgs.size();
            LOG.warn("Found {} organizations for user", numOrgs);
            return Optional.empty();
        }
        Organization foundOrg = validOrgs.get(0);
        Optional<OrganizationRoleClaims> foundRoles = orgRoles.stream()
                .filter(r -> r.getOrganizationExternalId().equals(foundOrg.getExternalId()))
                .findFirst();
        return foundRoles.map(r -> new OrganizationRoles(foundOrg, r.getGrantedRoles()));
    }

    public Organization getCurrentOrganization() {
        OrganizationRoles orgRole = getCurrentOrganizationRoles().orElseThrow(MisconfiguredUserException::new);
        return orgRole.getOrganization();
    }

    public Organization getOrganization(String externalId) {
        Optional<Organization> found = _repo.findByExternalId(externalId);
        return found.orElseThrow(()->new IllegalGraphqlArgumentException("An organization with that external ID does not exist"));
    }

    @AuthorizationConfiguration.RequireGlobalAdminUser
    public List<Organization> getOrganizations() {
        return _repo.findAll();
    }

    public void assertFacilityNameAvailable(String testingFacilityName) {
        Organization org = getCurrentOrganization();
        _facilityRepo.findByOrganizationAndFacilityName(org, testingFacilityName)
            .ifPresent(f->{throw new IllegalGraphqlArgumentException("A facility with that name already exists");});
    }

    public List<Facility> getFacilities(Organization org) {
        return _facilityRepo.findByOrganizationOrderByFacilityName(org);
    }

    public Facility getFacilityInCurrentOrg(UUID facilityId) {
        Organization org = getCurrentOrganization();
        return _facilityRepo.findByOrganizationAndInternalId(org, facilityId)
                .orElseThrow(()->new IllegalGraphqlArgumentException("facility could not be found"));
    }

    @Transactional(readOnly = false)
    @AuthorizationConfiguration.RequirePermissionEditFacility
    public Facility updateFacility(
        UUID facilityId,
        String testingFacilityName,
        String cliaNumber,
        String street,
        String streetTwo,
        String city,
        String county,
        String state,
        String zipCode,
        String phone,
        String email,
        String orderingProviderFirstName,
        String orderingProviderMiddleName,
        String orderingProviderLastName,
        String orderingProviderSuffix,
        String orderingProviderNPI,
        String orderingProviderStreet,
        String orderingProviderStreetTwo,
        String orderingProviderCity,
        String orderingProviderCounty,
        String orderingProviderState,
        String orderingProviderZipCode,
        String orderingProviderTelephone,
            DeviceTypeHolder deviceHolder
    ) {
        Facility facility = this.getFacilityInCurrentOrg(facilityId);
        facility.setFacilityName(testingFacilityName);
        facility.setCliaNumber(cliaNumber);
        facility.setTelephone(phone);
        facility.setEmail(email);
        StreetAddress af = facility.getAddress() == null ? new StreetAddress(
            street,
            streetTwo,
            city,
            county,
            state,
            zipCode
         ) : facility.getAddress();
        af.setStreet(street, streetTwo);
        af.setCity(city);
        af.setCounty(county);
        af.setState(state);
        af.setPostalCode(zipCode);
        facility.setAddress(af);

        Provider p = facility.getOrderingProvider();
        p.getNameInfo().setFirstName(orderingProviderFirstName);
        p.getNameInfo().setMiddleName(orderingProviderMiddleName);
        p.getNameInfo().setLastName(orderingProviderLastName);
        p.getNameInfo().setSuffix(orderingProviderSuffix);
        p.setProviderId(orderingProviderNPI);
        p.setTelephone(orderingProviderTelephone);

        StreetAddress a = p.getAddress() == null ? new StreetAddress(
            orderingProviderStreet,
            orderingProviderStreetTwo,
            orderingProviderCity,
            orderingProviderState,
            orderingProviderZipCode,
            orderingProviderCounty
         ) : p.getAddress();
        a.setStreet(orderingProviderStreet, orderingProviderStreetTwo);
        a.setCity(orderingProviderCity);
        a.setCounty(orderingProviderCounty);
        a.setState(orderingProviderState);
        a.setPostalCode(orderingProviderZipCode);
        p.setAddress(a);

        for (DeviceSpecimen ds : deviceHolder.getConfiguredDeviceTypes()) {
            facility.addDeviceSpecimen(ds);
        }
        // remove all existing devices
        for (DeviceSpecimen ds : facility.getDeviceSpecimens()) {
            if (!deviceHolder.getConfiguredDeviceTypes().contains(ds)) {
                facility.removeDeviceSpecimen(ds);
            }
        }
        facility.addDefaultDeviceSpecimen(deviceHolder.getDefaultDeviceType());
        return _facilityRepo.save(facility);
    }

    @Transactional(readOnly = false)
    @AuthorizationConfiguration.RequireGlobalAdminUser
    public Organization createOrganization(String name, String externalId, String testingFacilityName,
            String cliaNumber, StreetAddress facilityAddress, String phone, String email, DeviceTypeHolder deviceTypes,
            PersonName providerName, StreetAddress providerAddress, String providerTelephone, String providerNPI) {
        Organization org = _repo.save(new Organization(name, externalId));
        Provider orderingProvider = _providerRepo
                .save(new Provider(providerName, providerNPI, providerAddress, providerTelephone));
        Facility facility = new Facility(org, testingFacilityName, cliaNumber, facilityAddress, phone, email,
                orderingProvider, deviceTypes.getDefaultDeviceType(), deviceTypes.getConfiguredDeviceTypes());
        _facilityRepo.save(facility);
        _oktaRepo.createOrganization(name, externalId);
        return org;
    }

    @Transactional(readOnly = false)
    @AuthorizationConfiguration.RequirePermissionEditOrganization
    public Organization updateOrganization(String name) {
        Organization org = getCurrentOrganization();
        org.setOrganizationName(name);
        return _repo.save(org);
    }

    @Transactional(readOnly = false)
    @AuthorizationConfiguration.RequirePermissionEditFacility
    public Facility createFacility(String testingFacilityName, String cliaNumber, StreetAddress facilityAddress, String phone, String email,
            DeviceTypeHolder deviceTypes,
            PersonName providerName, StreetAddress providerAddress, String providerTelephone, String providerNPI) {
        Provider orderingProvider = _providerRepo.save(
                new Provider(providerName, providerNPI, providerAddress, providerTelephone));
        Organization org = getCurrentOrganization();
        Facility facility = new Facility(org,
            testingFacilityName, cliaNumber,
            facilityAddress, phone, email,
            orderingProvider,
            deviceTypes.getDefaultDeviceType(), deviceTypes.getConfiguredDeviceTypes());
        return _facilityRepo.save(facility);
    }
}
