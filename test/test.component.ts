import { Component } from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'test-app',
  templateUrl: 'test.component.html',
  styleUrls: [ 'test.component.css' ],
  providers: []
})
export class TestComponent {

  welcome = 'Test';

}
