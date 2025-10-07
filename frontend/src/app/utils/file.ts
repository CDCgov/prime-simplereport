export const file = (text: BlobPart) => {
  const blob = new Blob([text]);
  const file = new File([blob], "values.csv", { type: "text/csv" });
  File.prototype.text = jest.fn().mockResolvedValueOnce(text);
  return file;
};
