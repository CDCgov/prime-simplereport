import { render, screen, fireEvent } from "@testing-library/react";

import { PasswordForm } from "./PasswordForm";

describe("PasswordForm", () => {
  beforeEach(() => {
    render(<PasswordForm />);
  });

  it("thinks 'foo' is a weak password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "foo" },
    });
    expect(screen.getByText("Password strength: Weak")).toBeInTheDocument();
  });

  it("thinks 'fooBAR' is a weak password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR" },
    });
    expect(screen.getByText("Password strength: Weak")).toBeInTheDocument();
  });

  it("thinks 'fooBAR123' is a slightly less weak password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123" },
    });
    expect(screen.getByText("Password strength: Weak")).toBeInTheDocument();
  });

  it("thinks 'fooBAR123!' is an okay password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123!" },
    });
    expect(screen.getByText("Password strength: Okay")).toBeInTheDocument();
  });

  it("thinks 'fooBAR123!@#$%^&*()yeah' is a good password", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123!@#$%^&*()yeah" },
    });
    expect(screen.getByText("Password strength: Good")).toBeInTheDocument();
  });

  it("can type in the password confirmation", () => {
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "fooBAR123!@#$%^&*()yeah" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "fooBAR123!@#$%^&*()yeah" },
    });
    expect(screen.getByText("Password strength: Good")).toBeInTheDocument();
  });
});
