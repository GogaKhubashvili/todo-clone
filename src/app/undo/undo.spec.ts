import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Undo } from './undo';

describe('Undo', () => {
  let component: Undo;
  let fixture: ComponentFixture<Undo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Undo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Undo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
