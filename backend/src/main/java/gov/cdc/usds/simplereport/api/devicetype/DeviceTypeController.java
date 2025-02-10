package gov.cdc.usds.simplereport.api.devicetype;

import com.fasterxml.jackson.annotation.JsonView;
import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeLIVDSyncService;
import gov.cdc.usds.simplereport.service.DeviceTypeProdSyncService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class DeviceTypeController {
  @Autowired private DeviceTypeLIVDSyncService deviceTypeLIVDSyncService;
  @Autowired private DeviceTypeProdSyncService deviceTypeProdSyncService;
  @Autowired private DeviceTypeService deviceTypeService;

  @GetMapping("/devices/sync")
  public void syncDevices(@RequestParam boolean dryRun) {
    try {
      deviceTypeLIVDSyncService.syncDevices(dryRun);
    } catch (DryRunException e) {
      log.info("Dry run");
    }
  }

  @GetMapping("/devices")
  @JsonView(PublicDeviceType.class)
  public ResponseEntity<Object> getDevices(HttpServletRequest request) {
    try {
      String headerToken = request.getHeader("Sr-Prod-Devices-Token");
      deviceTypeProdSyncService.validateToken(headerToken);
      List<DeviceType> devices = deviceTypeService.fetchDeviceTypes();
      return ResponseEntity.status(HttpStatus.OK).body(devices);
    } catch (AccessDeniedException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }
  }
}
