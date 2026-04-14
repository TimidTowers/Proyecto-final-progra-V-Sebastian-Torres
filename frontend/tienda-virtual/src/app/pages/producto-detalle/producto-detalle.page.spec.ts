import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoDetallePage } from './producto-detalle.page';

describe('ProductoDetallePage', () => {
  let component: ProductoDetallePage;
  let fixture: ComponentFixture<ProductoDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
