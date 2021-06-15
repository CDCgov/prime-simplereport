package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FactorAndQrCode {
    private String factorId;

    private String qrcode;
}
