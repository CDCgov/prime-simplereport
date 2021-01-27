export function formatAddress(address: Address) {
  // format address with correct punctuation and separated by `\n`s
  const lastAddressLine = `${address.city}${
    address.state && address.city ? ", " : ""
  }${address.city && address.zipCode && !address.state ? " " : ""}${
    address.state
  }${address.state && address.zipCode ? " " : ""}${address.zipCode}`;

  let result = address.street;
  result += `${
    result.length > 0 && address.streetTwo
      ? "\n" + address.streetTwo
      : address.streetTwo
  }`;
  result += `${
    result.length > 0 && lastAddressLine
      ? "\n" + lastAddressLine
      : lastAddressLine
  }`;
  return result;
}
