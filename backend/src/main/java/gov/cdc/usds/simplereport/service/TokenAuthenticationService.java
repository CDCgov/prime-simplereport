package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import io.jsonwebtoken.Jwts;
import java.io.IOException;
import java.io.StringReader;
import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Date;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TokenAuthenticationService {
  @Value("${data-hub.url}")
  private String dataHubUrl;

  @Value("${data-hub.organization}")
  private String organization;

  @Value("${data-hub.signing-key}")
  private String signingKey;

  private RSAPrivateKey getRSAPrivateKey(String privateKey) throws InvalidRSAPrivateKeyException {
    try {
      PEMParser pemParser = new PEMParser(new StringReader(signingKey));
      PEMKeyPair keypair = (PEMKeyPair) pemParser.readObject();
      byte[] encoded = keypair.getPrivateKeyInfo().getEncoded();
      var kf = KeyFactory.getInstance("RSA");
      var spec = new PKCS8EncodedKeySpec(encoded);
      var key = (RSAPrivateKey) kf.generatePrivate(spec);
      return key;
    } catch (IOException e) {
      log.trace("Failed to retrieve encoded private key");
      throw new InvalidRSAPrivateKeyException(e);
    } catch (NoSuchAlgorithmException e) {
      log.trace("Given algorithm is not supported");
      throw new InvalidRSAPrivateKeyException(e);
    } catch (InvalidKeySpecException e) {
      log.trace("Failed to generate private key from the given key spec");
      throw new InvalidRSAPrivateKeyException(e);
    }
  }

  private String createJWT(String scope, String audience, Date exp, Key signingKey)
      throws InvalidRSAPrivateKeyException {

    return Jwts.builder()
        .setHeaderParam("kid", scope)
        .setHeaderParam("typ", "JWT")
        .setIssuer(scope)
        .setSubject(scope)
        .setAudience(audience)
        .setId(UUID.randomUUID().toString())
        .setExpiration(exp)
        .setIssuedAt(new Date())
        .signWith(signingKey)
        .compact();
  }

  public String createDataHubSenderToken() throws InvalidRSAPrivateKeyException {
    Date inFiveMinutes = new Date(System.currentTimeMillis() + 300 * 1000);

    return createJWT(
        organization + ".default", dataHubUrl, inFiveMinutes, getRSAPrivateKey(signingKey));
  }
}
