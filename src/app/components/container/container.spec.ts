import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Container } from './container';

@Component({
  selector: 'app-host',
  imports: [Container],
  template: `<app-container><span id="projected">projected</span></app-container>`,
})
class Host {}

describe('Container', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should project wrapped content', () => {
    const projected = fixture.nativeElement.querySelector('#projected');
    expect(projected?.textContent).toBe('projected');
  });
});
