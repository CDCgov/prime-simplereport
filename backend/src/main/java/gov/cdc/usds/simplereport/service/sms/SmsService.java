package gov.cdc.usds.simplereport.service.sms;

import javax.annotation.PostConstruct;
import javax.transaction.Transactional;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.twilio.type.PhoneNumber;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.PatientLinkService;

@Service
public class SmsService {
  private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);

  @Value("${twilio.from-number:+14045312484}")
  private String rawFromNumber;

  @Autowired
  PatientLinkService pls;

  @Autowired
  SmsProviderWrapper sms;

  private PhoneNumber fromNumber;

  private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

  @PostConstruct
  void init() throws NumberParseException {
    this.fromNumber = new PhoneNumber(formatNumber(rawFromNumber));
    LOG.debug("SmsService will send from {}", rawFromNumber);
  }

  @AuthorizationConfiguration.RequirePermissionStartTest
  @Transactional
  public String sendToPatientLink(String plid, String text) {
    PatientLink pl = pls.getPatientLink(plid);
    return sendToPerson(pl.getTestOrder().getPatient(), text);
  }

  private String sendToPerson(Person p, String text) {
    try {
      String msgId = sms.send(new PhoneNumber(formatNumber(p.getTelephone())), fromNumber, text);
      LOG.debug("SMS send initiated {}", msgId);
      return msgId;
    } catch (NumberParseException npe) {
      LOG.error("Failed to parse phone number {}", fromNumber);
    }
    return "";
  }

  String formatNumber(String number) throws NumberParseException {
    return phoneUtil.format(phoneUtil.parse(number, "US"), PhoneNumberFormat.E164);
  }
}
