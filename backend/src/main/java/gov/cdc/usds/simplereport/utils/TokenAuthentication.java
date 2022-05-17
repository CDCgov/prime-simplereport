package gov.cdc.usds.simplereport.utils;

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

@Slf4j
public class TokenAuthentication {
  private TokenAuthentication() {
    throw new IllegalStateException("TokenAuthentication is a utility class");
  }

  public static RSAPrivateKey getRSAPrivateKey(String privateKey)
      throws InvalidRSAPrivateKeyException {
    try {
      PEMParser pemParser = new PEMParser(new StringReader(privateKey));
      PEMKeyPair keypair = (PEMKeyPair) pemParser.readObject();
      byte[] encoded = keypair.getPrivateKeyInfo().getEncoded();
      var kf = KeyFactory.getInstance("RSA");
      var spec = new PKCS8EncodedKeySpec(encoded);
      var key = (RSAPrivateKey) kf.generatePrivate(spec);
      return key;
    } catch (IOException | NullPointerException e) {
      log.trace("Invalid private key");
      throw new InvalidRSAPrivateKeyException(e);
    } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
      throw new InvalidRSAPrivateKeyException(e);
    } catch (Exception e) {
      throw e;
    }
  }

  public static String createJWT(String scope, String audience, Date exp, Key signingKey)
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
}
