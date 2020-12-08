package gov.cdc.usds.simplereport.api.organization;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;


/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationMutationResolver implements GraphQLMutationResolver {

    private final OrganizationService _os;
    private final DeviceTypeService _dts;

    public OrganizationMutationResolver(OrganizationService os, DeviceTypeService dts) {
        _os = os;
        _dts = dts;
    }

    public void updateFacility(String facilityId,
                                   String testingFacilityName,
                                   String cliaNumber,
                                   String street,
                                   String streetTwo,
                                   String city,
                                   String county,
                                   String state,
                                   String zipCode,
                                   String phone,
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
                                   List<String> deviceIds,
                                   String defaultDeviceId) throws Exception {
        if (!deviceIds.contains(defaultDeviceId)) {
          throw new Exception("deviceIds must include defaultDeviceId");
        }
        DeviceType defaultDeviceType = _dts.getDeviceType(defaultDeviceId);
        if (defaultDeviceType == null) {
          throw new Exception("default device does not exist");
        }

        List<DeviceType> devices = new ArrayList<>();
        for(String id : deviceIds) {
          DeviceType d = _dts.getDeviceType(id);
          if(d==null) {
            throw new Exception("device does not exist");
          }
          devices.add(d);
        }
        _os.updateFacility(
          UUID.fromString(facilityId),
          testingFacilityName,
          cliaNumber,
          street,
          streetTwo,
          city,
          county,
          state,
          zipCode,
          phone,
          orderingProviderFirstName,
          orderingProviderMiddleName,
          orderingProviderLastName,
          orderingProviderSuffix,
          orderingProviderNPI,
          orderingProviderStreet,
          orderingProviderStreetTwo,
          orderingProviderCity,
          orderingProviderCounty,
          orderingProviderState,
          orderingProviderZipCode,
          orderingProviderTelephone,
          devices,
          defaultDeviceType
        );
    }

    public void updateOrganization(String name) {
        _os.updateOrganization(name);
    }
}



