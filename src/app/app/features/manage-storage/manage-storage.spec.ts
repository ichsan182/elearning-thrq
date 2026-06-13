import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStorage } from './manage-storage';

describe('ManageStorage', () => {
  let component: ManageStorage;
  let fixture: ComponentFixture<ManageStorage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStorage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageStorage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
