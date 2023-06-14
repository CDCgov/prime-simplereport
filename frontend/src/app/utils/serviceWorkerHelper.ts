export function isLocalHost(hostname?: string) {
  const regex = /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;

  return hostname
    ? Boolean(
        hostname === "localhost" ||
          // [::1] is the IPv6 localhost address.
          hostname === "[::1]" ||
          // 127.0.0.0/8 are considered localhost for IPv4.
          regex.exec(hostname)
      )
    : Boolean(window.location.hostname === "localhost");
}
