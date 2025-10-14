import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionFormComponent } from './devolucion-form.component';

describe('DevolucionFormComponent', () => {
  let component: DevolucionFormComponent;
  let fixture: ComponentFixture<DevolucionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DevolucionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevolucionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
