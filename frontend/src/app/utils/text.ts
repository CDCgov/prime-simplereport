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
