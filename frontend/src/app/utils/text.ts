export function capitalizeText(text = ""): string {
  // capitalizes first letter
  let result = text.toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function camelToSentenceCase(text = ""): string {
  return text
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .toLowerCase()
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

export function hasLowerCase(string: string) {
  return string.toUpperCase() != string;
}

export function hasUpperCase(string: string) {
  return string.toLowerCase() != string;
}

export function hasNumber(string: string) {
  return /\d/.test(string);
}

export function hasSymbol(string: string) {
  return /[^A-Za-z 0-9]/.test(string);
}
