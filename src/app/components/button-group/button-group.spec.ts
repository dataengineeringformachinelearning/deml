import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGroup } from './button-group';

@Component({
  selector: 'app-host',
  imports: [ButtonGroup],
  template: `
    <app-button-group align="end">
      <button type="button" id="projected">Action</button>
    </app-button-group>
  `,
})
class Host {}

describe('ButtonGroup', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should project wrapped button content', () => {
    const projected = fixture.nativeElement.querySelector('#projected');
    expect(projected?.textContent?.trim()).toBe('Action');
  });

  it('should apply align via host class', () => {
    const group = fixture.nativeElement.querySelector('app-button-group') as HTMLElement;
    expect(group.classList.contains('place-end')).toBe(true);
  });
});
