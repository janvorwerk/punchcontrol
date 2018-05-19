import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceCoursesComponent } from './race-courses.component';

describe('RaceCoursesComponent', () => {
  let component: RaceCoursesComponent;
  let fixture: ComponentFixture<RaceCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaceCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaceCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
