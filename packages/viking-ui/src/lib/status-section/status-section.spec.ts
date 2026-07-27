import { TestBed } from "@angular/core/testing";

import { StatusSectionComponent } from "./status-section";

describe("Viking status section accessibility", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusSectionComponent],
    }).compileComponents();
  });

  it("labels the native section landmark instead of the custom-element host", () => {
    const fixture = TestBed.createComponent(StatusSectionComponent);
    fixture.componentRef.setInput("title", "Platform");
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const section = host.querySelector("section");

    expect(host.hasAttribute("aria-label")).toBe(false);
    expect(section?.getAttribute("aria-label")).toBe(
      "Platform status overview",
    );
  });
});
