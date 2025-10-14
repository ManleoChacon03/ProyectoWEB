import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDevolucionesComponent } from './gestion-devoluciones.component';

describe('GestionDevolucionesComponent', () => {
  let component: GestionDevolucionesComponent;
  let fixture: ComponentFixture<GestionDevolucionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionDevolucionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionDevolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
