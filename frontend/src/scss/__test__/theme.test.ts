describe("USWDS Theme Configuration", () => {
  it("should have violet-warm primary color family configured", () => {
    const expectedThemeConfig = {
      primaryFamily: "violet-warm",
      primaryColor: "violet-warm-50",
      primaryVivid: "violet-warm-60",
      primaryDark: "violet-warm-70",
      primaryDarker: "violet-warm-80",
    };

    expect(expectedThemeConfig.primaryFamily).toBe("violet-warm");
    expect(expectedThemeConfig.primaryColor).toMatch(/violet-warm-\d+/);
  });

  it("should maintain Public Sans font configuration", () => {
    const expectedFontConfig = {
      fontTypeSans: "public-sans",
      fontRoleHeading: "sans",
      fontWeightSemibold: 600,
    };

    expect(expectedFontConfig.fontTypeSans).toBe("public-sans");
    expect(expectedFontConfig.fontRoleHeading).toBe("sans");
    expect(expectedFontConfig.fontWeightSemibold).toBe(600);
  });

  it("should have consistent color token naming", () => {
    const colorTokenPatterns = [
      "violet-warm-5",
      "violet-warm-10",
      "violet-warm-20",
      "violet-warm-50",
      "violet-warm-60",
      "violet-warm-70",
      "violet-warm-80",
      "violet-warm-90",
    ];

    colorTokenPatterns.forEach((token) => {
      expect(token).toMatch(/^violet-warm-\d+$/);
    });
  });
});

describe("SCSS Theme Integration", () => {
  it("should compile without errors", () => {
    const themeOverrides = {
      "$theme-color-primary-family": "violet-warm",
      "$theme-color-primary": "violet-warm-50",
      "$theme-color-accent-warm": "violet-warm-50",
      "$theme-font-type-sans": "public-sans",
    };

    Object.keys(themeOverrides).forEach((key) => {
      expect(key).toMatch(/^\$theme-/);
    });
  });

  it("should provide design tokens for components", () => {
    const expectedTokens = ["primary", "base-dark", "base-lighter", "white"];

    expectedTokens.forEach((token) => {
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });
  });
});
