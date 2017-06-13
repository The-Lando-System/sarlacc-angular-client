import { Component, OnInit } from '@angular/core';

import { Broadcaster } from '../src/broadcaster';
import { UserService } from '../src/user.service';
import { User } from '../src/user';
import { Token } from '../src/token';

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
    private userService: UserService,
    private bcaster: Broadcaster
  ){}

  ngOnInit(): void {
    this.logout();
    this.listenForMessages();
    this.listenForMessagesMultiKey();
  }

  // Public Methods =================================================

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

    }).catch(() => {

      this.outputTitle = 'Return User:';
      this.outputData = 'User is not logged in, so details could not be retrieved';
      this.loading = false;
    });

  }

  getAppRoles(): void {
    let appRoles = this.userService.getAppRoles();
    this.outputTitle = 'Get App Roles:'
    this.outputData = appRoles ? JSON.stringify(appRoles, null, '  ') : 'Failed to get App Roles. Try logging in first.';
  }

  getRoleForApp(appName:string): void {
    let role = this.userService.getRoleForApp(appName);
    this.outputTitle = 'Get Role for App [' + appName + ']:';
    this.outputData = role ? 'Role: ' + role : 'Failed to find a role for given App Name.';
  }

  isAdminForApp(appName:string): void {
    let isAdmin = this.userService.isAdminForApp(appName);
    this.outputTitle = 'Is Admin for App [' + appName + ']:';
    this.outputData = 'Answer: ' + isAdmin;
  }

  getAuthHeaders(): void {
    let headers:any = this.userService.getAuthHeaders();
    this.outputTitle = 'Get Auth Headers:'
    this.outputData = headers ? JSON.stringify(headers, null, '  ') : 'Failed to get Auth Headers. Try logging in first.';
  }

  getUserAuthHeaders(): void {
    let headers:any = this.userService.getUserAuthHeaders();
    this.outputTitle = 'Get User Auth Headers:'
    this.outputData = headers ? JSON.stringify(headers, null, '  ') : 'Failed to get User Auth Headers. Try logging in first.';
  }

  clearUser(): void {
    this.userService.clearUser();
    this.outputTitle = 'Clear User:'
    this.outputData = 'User was cleared from user service';
  }

  getTokenFromCookie(): void {
    let accessToken = this.userService.getTokenFromCookie();
    this.outputTitle = 'Get Token From Cookies:'
    this.outputData = accessToken ? 'access-token: ' + accessToken : 'No access token found in the cookies';
  }

  putTokenInCookie(): void {
    let token:Token = new Token();
    token.access_token = 'test-access-token-value';
    token.refresh_token = 'test-refresh-token-value';
    this.userService.putTokenInCookie(token);
    this.getTokenFromCookie();
  }

  removeTokenFromCookie(): void {
    let accessToken = this.userService.removeTokenFromCookie();
    this.getTokenFromCookie();
  }


  broadcastMessage1(): void {
    this.bcaster.broadcast('KEY_1',{'KEY_1':'hello world 1!'});
  }

  broadcastMessage2(): void {
    this.bcaster.broadcast('KEY_2',{'KEY_2':'hello world 2!'});
  }

  broadcastMessage3(): void {
    this.bcaster.broadcast('KEY_3',{'KEY_3':'hello world 3!'});
  }

  listenForMessages(): void {
    this.bcaster.on<any>('KEY_1')
    .subscribe(message => {
      this.outputTitle = 'Received Single Key Broadcast Message:'
      this.outputData = JSON.stringify(message, null, '  ');
    });
  }

  listenForMessagesMultiKey(): void {
    this.bcaster.onAny<any>(['KEY_2','KEY_3'])
    .subscribe(message => {
      this.outputTitle = 'Received Multi Key Broadcast Message:'
      this.outputData = JSON.stringify(message, null, '  ');
    });
  }

  // Private Methods =========================================

  private clearState(): void {
    this.outputTitle = 'Output Title';
    this.outputData = 'Output Details';
    this.loading = false;
  }

  private createError(details:string): void {
    this.outputTitle = "Error!";
    this.outputData = "Message from user service:\n" + details;
  }

}
