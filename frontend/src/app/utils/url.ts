export function getUrl(): string {
  if (process.env.REACT_APP_BASE_URL) {
    const url = process.env.REACT_APP_BASE_URL + process.env.PUBLIC_URL;
    return url.charAt(url.length - 1) === "/" ? url : url + "/";
  }
  return "http://localhost:3000/";
}
