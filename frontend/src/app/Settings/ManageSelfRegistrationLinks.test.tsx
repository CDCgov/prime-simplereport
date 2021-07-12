import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ComponentProps } from "react";

import { ManageSelfRegistrationLinks } from "./ManageSelfRegistrationLinks";

const props: ComponentProps<typeof ManageSelfRegistrationLinks> = {
  organizationSlug: "abc22",
  facilitySlugs: [
    { name: "Foo Facility", slug: "foo66" },
    { name: "Physics Building", slug: "phys2" },
  ],
  howItWorksPath: "/how-it-works",
  isNewFeature: true,
  baseUrl: "https://some-base-url.com",
};

describe("ManageSelfRegistrationLinks", () => {
  const nav = { ...navigator };

  beforeEach(async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    render(<ManageSelfRegistrationLinks {...props} />);
    await screen.findByText("Patient self-registration");
  });

  afterEach(() => {
    Object.assign(navigator, nav);
  });

  it("copies the org link", async () => {
    const orgUrl = `${
      props.baseUrl
    }/register/${props.organizationSlug.toUpperCase()}`;
    const [orgBtn] = screen.getAllByRole("button");
    await waitFor(() => {
      fireEvent.click(orgBtn);
    });
    expect(navigator.clipboard.writeText).toBeCalledWith(orgUrl);
  });

  it("copies a facility link", async () => {
    const facilityUrl = `${
      props.baseUrl
    }/register/${props.facilitySlugs[1].slug.toUpperCase()}`;
    const btns = screen.getAllByRole("button");
    await waitFor(() => {
      fireEvent.click(btns[2]);
    });
    expect(navigator.clipboard.writeText).toBeCalledWith(facilityUrl);
  });
});
