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

  welcome = 'Test';

  user: User;
  userDetails = "";
  creds = {};
  returnedUser = "";

  loginLoading = false;
  
  errorMessage = '';

  constructor(
    private userService: UserService
  ){}

  ngOnInit(): void {
    this.logout();
  }

  getUser(): void {
    this.userService.returnUser()
    .then((user:User) => {
      console.log(user);
    }).catch((err:any) => {
      this.errorMessage = JSON.stringify(err, null, '  ');
    })
  }

  login(): void {
    event.preventDefault();
    this.loginLoading = true;
    this.errorMessage = '';

    this.userService.login(this.creds)
    .then((user:any) => {
      this.user = user;
      this.userDetails = JSON.stringify(user, null, '  ');
      this.loginLoading = false;
      this.creds = {};
    }).catch((err:any) => {
      this.loginLoading = false;
      this.errorMessage = JSON.stringify(err, null, '  ');
    });
  }

  logout(): void {
    event.preventDefault();
    this.clearState();
    this.userService.logout();
    this.user = null;
  }

  returnUser(): void {
    event.preventDefault();

    this.userService.returnUser()
    .then((user:User) => {
      this.returnedUser = JSON.stringify(user, null, '  ');
    }).catch((err:any) => {
      this.errorMessage = JSON.stringify(err, null, '  ');
    });

  }

  clearState(): void {
    this.user = null;
    this.userDetails = '';
    this.returnedUser = '';
    this.errorMessage = '';
    this.loginLoading = false;
  }

}
