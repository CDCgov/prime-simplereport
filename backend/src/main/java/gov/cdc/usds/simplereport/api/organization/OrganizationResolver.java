package gov.cdc.usds.simplereport.api.organization;

import java.util.List;
import java.util.stream.Collectors;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationResolver implements GraphQLQueryResolver  {

    private ApiUserService _userService;
    private DeviceTypeService _deviceService;
	private OrganizationService _organizationService;

    public OrganizationResolver(OrganizationService os, ApiUserService users, DeviceTypeService devices) {
        _organizationService = os;
        _userService = users;
        _deviceService = devices;
    }

    public Organization getOrganization() {

        List<DeviceType> currentDevices = _deviceService.fetchDeviceTypes();
        List<String> currentDeviceNames = currentDevices.stream().map(d->d.getName()).collect(Collectors.toList());
        if (!currentDeviceNames.contains("Abbott IDNow")) {
            _deviceService.createDeviceType("Abbott IDNow", "ID Now", "Abbott");
        }
        if (!currentDeviceNames.contains("Abbott BinaxNow")) {
            _deviceService.createDeviceType("Abbott BinaxNow", "BinaxNOW COVID-10 Ag Card", "Abbott");
        }
        if (!currentDeviceNames.contains("Quidel Sofia 2")) {
            _deviceService.createDeviceType("Quidel Sofia 2", "Sofia 2 SARS Antigen FIA", "Quidel");
        }
        if (!currentDeviceNames.contains("BD Veritor")) {
            _deviceService.createDeviceType("BD Veritor", "BD Veritor System for Rapid Detection of SARS-CoV-2*", "Becton, Dickinson and Company (BD)");
        }
        if (!currentDeviceNames.contains("LumiraDX")) {
            _deviceService.createDeviceType("LumiraDX", "LumiraDX", "LumiraDX");
        }
        return _organizationService.getCurrentOrganization();
    }

    public User getWhoami() {
		ApiUser currentUser = _userService.getCurrentUser();
		Organization currentOrg = _organizationService.getCurrentOrganization();
		return new User(currentUser, currentOrg);
	}
}
