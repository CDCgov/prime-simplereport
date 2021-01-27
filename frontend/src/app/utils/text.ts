export function capitalizeText(text = ""): string {
  // capitalizes first letter
  let result = text.toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}
