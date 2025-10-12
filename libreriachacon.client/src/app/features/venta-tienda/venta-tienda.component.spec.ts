import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaTiendaComponent } from './venta-tienda.component';

describe('VentaTiendaComponent', () => {
  let component: VentaTiendaComponent;
  let fixture: ComponentFixture<VentaTiendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VentaTiendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentaTiendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
