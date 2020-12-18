package gov.cdc.usds.simplereport.api.organization;

import java.util.List;
import java.util.UUID;

import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.db.model.DeviceType;

@Component
public class DeviceTypeMutationResolver implements GraphQLMutationResolver {

    private final DeviceTypeService _dts;

    public DeviceTypeMutationResolver(DeviceTypeService dts) {
        _dts = dts;
    }

    public DeviceType createDeviceType(
        String name,
        String manufacturer,
        String model,
        String loincCode
    ) throws Exception {
        return _dts.createDeviceType(name, manufacturer, model, loincCode);
    }

    public DeviceType updateDeviceType(
        String id,
        String name,
        String manufacturer,
        String model,
        String loincCode
    ) throws Exception {
        return _dts.updateDeviceType(id, name, manufacturer, model, loincCode);
    }
}
