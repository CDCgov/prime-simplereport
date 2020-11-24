package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

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

    public void updateOrganization(String testingFacilityName,
                                   String cliaNumber,
                                   String orderingProviderFirstName,
                                   String orderingProviderLastName,
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
        _os.updateOrganization(
          testingFacilityName,
          cliaNumber,
          orderingProviderFirstName,
          orderingProviderLastName,
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
}



