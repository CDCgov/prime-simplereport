export const zipCodeRegex = /^\d{5}(?:[-\s]\d{4})?$/;

export function formatAddress(address: Address) {
  // format address with correct punctuation and separated by `\n`s
  const lastAddressLine = `${address.city ? address.city : ""}${
    address.state && address.city ? ", " : ""
  }${address.city && address.zipCode && !address.state ? " " : ""}${
    address.state
  }${address.state && address.zipCode ? " " : ""}${address.zipCode}`;

  let result = address.street;
  const streetTwo = address.streetTwo ? address.streetTwo : "";
  result += `${result.length > 0 && streetTwo ? "\n" + streetTwo : streetTwo}`;
  result += `${
    result.length > 0 && lastAddressLine
      ? "\n" + lastAddressLine
      : lastAddressLine
  }`;
  return result;
}

export const newLineSpan = ({ text = "" }) => {
  return text.split("\n").map((str, index) => (
    <span className="display-block" key={`newLineSpan${index}`}>
      {str}
    </span>
  ));
};
