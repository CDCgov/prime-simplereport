package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.helpers.mail.Mail;
import java.io.IOException;

public interface EmailProvider {
  public String send(Mail mail) throws IOException;
}
