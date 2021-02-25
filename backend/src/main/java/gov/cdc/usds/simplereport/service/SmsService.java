package gov.cdc.usds.simplereport.service;

import javax.annotation.PostConstruct;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;

@ConditionalOnProperty(name="twilio.enabled", havingValue="true")
@Service
public class SmsService {
  private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);

  @Value("${twilio.from-number}")
  private String FROM_NUMBER;

  @Autowired
  PatientLinkService pls;

  private PhoneNumber fromNumber;

  private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

  @PostConstruct
  public void init() throws NumberParseException {
    this.fromNumber = new PhoneNumber(formatNumber(FROM_NUMBER));
    LOG.info("Twilio is enabled, sending from {}", FROM_NUMBER);
  }

  public String sendToPatientLink(String plid, String text) {
    PatientLink pl = pls.getPatientLink(plid);
    return sendToPerson(pl.getTestOrder().getPatient(), text);
  }

  @AuthorizationConfiguration.RequirePermissionStartTest
  public String sendToPerson(Person p, String text) {
    try {
      Message msg = Message.creator(new PhoneNumber(formatNumber(p.getTelephone())), fromNumber, text).create();
      LOG.debug("SMS send initiated {}", msg.getSid());
      return msg.getSid();
    } catch (NumberParseException npe) {
      LOG.error("Failed to parse phone number {}", fromNumber);
    }
    return "";
  }

  private String formatNumber(String number) throws NumberParseException {
    return phoneUtil.format(phoneUtil.parse(number, "US"), PhoneNumberFormat.E164);
  }
}
