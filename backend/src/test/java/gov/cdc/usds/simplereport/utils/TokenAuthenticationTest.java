package gov.cdc.usds.simplereport.utils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import java.security.interfaces.RSAPrivateKey;
import org.junit.jupiter.api.Test;

class TokenAuthenticationTest {
  private final TokenAuthentication sut = new TokenAuthentication();

  String fakeSigningKey =
      "-----BEGIN RSA PRIVATE KEY-----\n"
          + "MIIBOgIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy1tPf9Cnzj4p4WGeKLs1Pt8Qu\n"
          + "KUpRKfFLfRYC9AIKjbJTWit+CqvjWYzvQwECAwEAAQJAIJLixBy2qpFoS4DSmoEm\n"
          + "o3qGy0t6z09AIJtH+5OeRV1be+N4cDYJKffGzDa88vQENZiRm0GRq6a+HPGQMd2k\n"
          + "TQIhAKMSvzIBnni7ot/OSie2TmJLY4SwTQAevXysE2RbFDYdAiEBCUEaRQnMnbp7\n"
          + "9mxDXDf6AU0cN/RPBjb9qSHDcWZHGzUCIG2Es59z8ugGrDY+pxLQnwfotadxd+Uy\n"
          + "v/Ow5T0q5gIJAiEAyS4RaI9YG8EWx/2w0T67ZUVAw8eOMB6BIUg0Xcu+3okCIBOs\n"
          + "/5OiPgoTdSy7bcF9IGpSE8ZgGKzgYQVZeN97YE00\n"
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
}
