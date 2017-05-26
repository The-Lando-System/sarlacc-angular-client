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
      console.log(err);
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
    }).catch((error:any) => {
      console.log(error);
      this.loginLoading = false;
      this.errorMessage = error;
    });
  }

  logout(): void {
    event.preventDefault();
    this.userService.logout();
    this.user = null;
  }

}
