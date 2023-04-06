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

function createSupportMailToLink(msg: string, index: number) {
  return (
    <span key={index}>
      {" "}
      <a href="mailto:support@simplereport.gov">{msg}</a>{" "}
    </span>
  );
}

function createContactUsLink(msg: string, nextMsg: string, index: number) {
  return (
    <span key={index}>
      {" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.simplereport.gov/contact-us"
      >
        {msg} {nextMsg}
      </a>{" "}
    </span>
  );
}

export function getBody(message: string): JSX.Element {
  let errorText = getErrorText(message, "body");
  let errorTextArray = errorText.split(" ");
  let errorElementArray: any = [];
  let addHTMLElement = true;
  errorTextArray.forEach((msg, index) => {
    let nextMsg = errorTextArray[index + 1];
    if (msg.includes("support@simplereport.gov")) {
      errorElementArray.push(createSupportMailToLink(msg, index));
      addHTMLElement = true;
    } else if (msg.includes("SimpleReport") && nextMsg.includes("support")) {
      errorElementArray.push(createContactUsLink(msg, nextMsg, index));
      errorTextArray.splice(index + 1, 1);
      addHTMLElement = true;
    } else {
      if (addHTMLElement) {
        errorElementArray.push(msg);
      } else {
        let currentErrorElementArrayIndex = errorElementArray.length - 1;
        errorElementArray[
          currentErrorElementArrayIndex
        ] = `${errorElementArray[currentErrorElementArrayIndex]} ${msg}`;
      }
      addHTMLElement = false;
    }
  });
  return <span>{errorElementArray}</span>;
}
