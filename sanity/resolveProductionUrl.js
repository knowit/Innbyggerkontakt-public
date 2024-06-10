const remoteURL = "https://innbyggerkontakt-info-dev.web.app";
const localURL = "http://localhost:8000";
const previewURL =
  window.location.hostname === "localhost" ? localURL : remoteURL;

export default function resolveProductionUrl(document) {
  return `${previewURL}/dokumentasjon`;
}
