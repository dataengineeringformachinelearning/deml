import { TestBed } from "@angular/core/testing";

import { VikingSearchPalette } from "./search-palette";

describe("Viking search palette accessibility", () => {
  it("uses a non-landmark container for keyboard hints", () => {
    const fixture = TestBed.createComponent(VikingSearchPalette);
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector(".viking-search-palette-footer")).not.toBeNull();
    expect(host.querySelector("footer")).toBeNull();
  });
});
