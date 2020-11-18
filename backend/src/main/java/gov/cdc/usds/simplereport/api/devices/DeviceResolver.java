package gov.cdc.usds.simplereport.api.devices;

import gov.cdc.usds.simplereport.db.model.Device;
import gov.cdc.usds.simplereport.service.DeviceService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class DeviceResolver implements GraphQLQueryResolver {

    private final DeviceService _ds;

    public DeviceResolver(DeviceService ds) {
        this._ds = ds;
    }

    List<Device> getDevice() {
        return _ds.getDevices();
    }
}
