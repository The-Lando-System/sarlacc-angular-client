import { Component, OnInit } from '@angular/core';

import { UserService } from '../src/user.service';
import { User } from '../src/user';

@Component({
  moduleId: module.id,
  selector: 'test-app',
  templateUrl: 'test.component.html',
  styleUrls: [ 'test.component.css' ],
  providers: []
})
export class TestComponent implements OnInit {

  private outputTitle:string;
  private outputData:string;

  private loading:boolean = false;
  private creds:any = {};

  constructor(
    private userService: UserService
  ){}

  ngOnInit(): void {
    this.logout();
  }

  login(): void {
    event.preventDefault();
    this.loading = true;

    this.userService.login(this.creds)
    .then((user:any) => {

      this.outputTitle = 'Login Success! Returned User Details:'
      this.outputData = JSON.stringify(user, null, '  ');

      this.loading = false;
      this.creds = {};
    }).catch((err:any) => {
      this.loading = false;
      this.createError(JSON.stringify(err, null, '  '));
    });
  }

  logout(): void {
    event.preventDefault();
    this.clearState();
    this.userService.logout();
  }

  returnUser(): void {
    event.preventDefault();

    this.loading = true;

    this.userService.returnUser()
    .then((user:User) => {

      this.outputTitle = 'Return User Success! Returned User Details:'
      this.outputData = JSON.stringify(user, null, '  ');
      
      this.loading = false;

    }).catch((err:any) => {
      this.createError(JSON.stringify(err, null, '  '));
      this.loading = false;
    });

  }

  clearState(): void {
    this.outputTitle = 'Output Title';
    this.outputData = 'Output Details';
    this.loading = false;
  }

  private createError(details:string): void {
    this.outputTitle = "Error!";
    this.outputData = details;
  }

}
