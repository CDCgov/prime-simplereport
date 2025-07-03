export const file = (text: BlobPart) => {
  const blob = new Blob([text]);
  const file = new File([blob], "values.csv", { type: "text/csv" });
  File.prototype.text = jest.fn().mockResolvedValueOnce(text);
  return file;
};

interface TriggerBlobDownloadOptions {
  blob: Blob;
  contentDisposition?: string;
  defaultFilename?: string;
}

export const triggerBlobDownload = ({
  blob,
  contentDisposition,
  defaultFilename = "download",
}: TriggerBlobDownloadOptions): void => {
  let filename = defaultFilename;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename=(.+)/);
    if (match) filename = match[1];
  }

  const urlBlob = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = urlBlob;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);
};
