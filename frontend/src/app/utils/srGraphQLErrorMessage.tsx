const DEFAULT_HEADER = "Something went wrong";
const DEFAULT_BODY = "Please check for errors and try again";
const END_TEXT = ";";

type StartString = "header" | "body";

function getErrorText(message: string, startString: StartString): string {
  let startText = `${startString}:`;
  let startTextIndex = message.indexOf(startText);
  let startTextExists = startTextIndex >= 0;
  let sliceStartIndex = startTextExists
    ? startTextIndex + startText.length
    : -1;
  let endTextIndex = message.indexOf(END_TEXT, startTextIndex);
  let sliceEndIndex =
    endTextIndex > startTextIndex ? endTextIndex : message.length;
  let defaultText = startString === "header" ? DEFAULT_HEADER : DEFAULT_BODY;
  return startTextExists
    ? message.slice(sliceStartIndex, sliceEndIndex).trim()
    : defaultText;
}
export function getHeader(message: string): string {
  return getErrorText(message, "header");
}

export function getBody(message: string): JSX.Element {
  let errorText = getErrorText(message, "body");
  let errorTextArray = errorText.split(" ");
  let errorElementArray: any = [];
  let addNewValue = true;
  errorTextArray.forEach((msg, index) => {
    if (msg.includes("support@simplereport.gov")) {
      let addEndWhitespace = index !== errorTextArray.length - 1;
      errorElementArray.push(
        <span key={index}>
          {" "}
          <a href="mailto:support@simplereport.gov">{msg}</a>
          {addEndWhitespace ? " " : ""}
        </span>
      );
      addNewValue = true;
    } else {
      if (addNewValue) {
        errorElementArray.push(msg);
      } else {
        let currentErrorElementArrayIndex = errorElementArray.length - 1;
        errorElementArray[
          currentErrorElementArrayIndex
        ] = `${errorElementArray[currentErrorElementArrayIndex]} ${msg}`;
      }
      addNewValue = false;
    }
  });
  return <span>{errorElementArray}</span>;
}
