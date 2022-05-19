package gov.cdc.usds.simplereport.utils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import io.jsonwebtoken.Jwts;
import java.security.interfaces.RSAPrivateKey;
import java.util.Base64;
import java.util.Date;
import org.junit.jupiter.api.Test;

class TokenAuthenticationTest {
  private final TokenAuthentication sut = new TokenAuthentication();

  String fakeSigningKey =
      "-----BEGIN RSA PRIVATE KEY-----\n"
          + "MIIEowIBAAKCAQEApwni+ErA4h6wyqAYz39pf3dOlvgRX8I1npz2Cx3Y1ASNl0zf\n"
          + "hCK+9r48FisEuRb36iEz8OPk4O7hZIWb2cHg7wNXwUL09jO0rdSquGyPiJXNM/v0\n"
          + "4CTZo61r5iZ1cLSnLSw0NU4BOedK2mZaFqJhFJDeu44TGmz/x+8l50JAgD3XGk/N\n"
          + "lTyYgRGwqpu8TFcCT8XoxEYq2QScfxq+2FnGNFX6bVi1zDSj0yBv90uelsM226zw\n"
          + "zdGO0MZnls4AqwfzayTL4zQlI/2CFajnf4noagjbkR8jdFk4je5kLa58smRKA+ce\n"
          + "1cb6UHfPQJD6+lVgSLU2uHmoj2KGmPDHtCDEtwIDAQABAoIBABDyJyflUuLIa6Bt\n"
          + "ftbeKDJu73bQEoMnzWTFVmNo/cGp90CtjdIhQZpVUPyMFLM/qfBYufpARHdar1xm\n"
          + "qZmn2k1P24FBwl7lKU6mpUMx0EXyXJpff0eWCsuuIPonq1ZpyA6vI1odCxwiuNdQ\n"
          + "oZHA8MmzVhqqSTSEcQE0OSDYTyQzTTrwX+3g41WRHH24uN479DWQfIVcPX7u3k8U\n"
          + "jfgwtD3TYLQ2kiOawQ5WbxOPtLMPsa8GA8/PDNit9DSaDQuTv4mATnwuJMp2FeUa\n"
          + "9m3M/bcaEgTiEHq77kJZ8srJF/r+OwKbrxPE3eeSPEfuP+wkg5AgOjhLnrdzwVRU\n"
          + "DFGWvOECgYEAyIk7F0S0AGn2aryhw9CihDfimigCxEmtIO5q7mnItCfeQwYPsX72\n"
          + "1fLpJNgfPc9DDfhAZ2hLSsBlAPLUOa0Cuny9PCBWVuxi1WjLVaeZCV2bF11mAgW2\n"
          + "fjLkAXT34IX+HZl60VoetSWq9ibfkJHeCAPnh/yjdB3Vs+2wxNkU8m8CgYEA1Tzm\n"
          + "mjJq7M6f+zMo7DpRwFazGMmrLKFmHiGBY6sEg7EmoeH2CkAQePIGQw/Rk16gWJR6\n"
          + "DtUZ9666sjCH6/79rx2xg+9AB76XTFFzIxOk9cm49cIosDMk4mogSfK0Zg8nVbyW\n"
          + "5nEb//9JCrZ18g4lD3IrT5VJoF4MhfdBUjAS1jkCgYB+RDIpv3+bNx0KLgWpFwgN\n"
          + "Omb667B6SW2ya4x227KdBPFkwD9HYosnQZDdOxvIvmUZObPLqJan1aaDR2Krgi1S\n"
          + "oNJCNpZGmwbMGvTU1Pd+Nys9NfjR0ykKIx7/b9fXzman2ojDovvs0W/pF6bzD3V/\n"
          + "FH5HWKLOrS5u4X3JJGqVDwKBgQCd953FwW/gujld+EpqpdGGMTRAOrXqPC7QR3X5\n"
          + "Beo0PPonlqOUeF07m9/zsjZJfCJBPM0nS8sO54w7ESTAOYhpQBAPcx/2HMUsrnIj\n"
          + "HBxqUOQKe6l0zo6WhJQi8/+cU8GKDEmlsUlS3iWYIA9EICJoTOW08R04BjQ00jS7\n"
          + "1A1AUQKBgHlHrV/6S/4hjvMp+30hX5DpZviUDiwcGOGasmIYXAgwXepJUq0xN6aa\n"
          + "lnT+ykLGSMMY/LABQiNZALZQtwK35KTshnThK6zB4e9p8JUCVrFpssJ2NCrMY3SU\n"
          + "qw87K1W6engeDrmunkJ/PmvSDLYeGiYWmEKQbLQchTxx1IEddXkK\n"
          + "-----END RSA PRIVATE KEY-----";

  @Test
  void getRSAPrivateKey_onInvalidKey_throws() {
    assertThrows(
        InvalidRSAPrivateKeyException.class, () -> sut.getRSAPrivateKey("fake-signing-key"));
  }

  @Test
  void getRSAPrivateKey_onValidKey_returnsKey() {
    assertDoesNotThrow(() -> sut.getRSAPrivateKey(fakeSigningKey));
    assertTrue(sut.getRSAPrivateKey(fakeSigningKey) instanceof RSAPrivateKey);
  }

  @Test
  void createRSAJWT_contentsOk() {
    var scope = "scope";
    var audience = "audience";
    var exp = new Date(System.currentTimeMillis() + 300_000);

    var token = sut.createRSAJWT(scope, audience, exp, fakeSigningKey);

    var claims =
        Jwts.parserBuilder()
            .setSigningKey(sut.getRSAPrivateKey(fakeSigningKey))
            .build()
            .parseClaimsJws(token);

    assertEquals("scope", claims.getHeader().getKeyId());
    assertEquals("RS256", claims.getHeader().getAlgorithm());

    assertEquals(scope, claims.getBody().getIssuer());
    assertEquals(scope, claims.getBody().getSubject());
    assertEquals(audience, claims.getBody().getAudience());
    assertEquals(exp.toString(), claims.getBody().getExpiration().toString());
  }
}
