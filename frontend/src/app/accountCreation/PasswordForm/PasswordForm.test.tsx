import { render, screen, fireEvent } from "@testing-library/react";

import { PasswordForm } from "./PasswordForm";

describe("PasswordForm", () => {
  beforeEach(() => {
    render(<PasswordForm />);
  });

  const strengthLabel = (label: string) => (content: string, element: any) => {
    return (
      element.tagName.toLowerCase() === "span" && content.startsWith(label)
    );
  };

  it("requires a password", () => {
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.getByText(
        "Your password must have a lowercase letter, an uppercase letter, a number and at least 8 characters"
      )
    ).toBeInTheDocument();
  });

  it("thinks 'foo' is a weak password", () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "foo" },
    });
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR' is a weak password", () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR" },
    });
    expect(screen.getByText(strengthLabel("Weak"))).toBeInTheDocument();
  });

  it("thinks 'fooB1' is an okay password", () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooB1" },
    });
    expect(screen.getByText(strengthLabel("Okay"))).toBeInTheDocument();
  });

  it("thinks 'fooBAR123!' is a good password", () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR123!" },
    });
    expect(screen.getByText(strengthLabel("Good"))).toBeInTheDocument();
  });

  it("can type in the password confirmation", () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "fooBAR123!" },
      }
    );
    expect(screen.getByText(strengthLabel("Good"))).toBeInTheDocument();
  });

  it("requires passwords to match", () => {
    fireEvent.change(screen.getByLabelText("Password *"), {
      target: { value: "fooBAR123!" },
    });
    fireEvent.change(
      screen.getByLabelText("Confirm password", { exact: false }),
      {
        target: { value: "fooBAR123" },
      }
    );
    expect(screen.getByText(strengthLabel("Good"))).toBeInTheDocument();
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Passwords must match")).toBeInTheDocument();
  });
});
