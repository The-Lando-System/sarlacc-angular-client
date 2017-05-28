import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { Broadcaster } from './broadcaster';
import { User } from './user';
import { Token } from './token';
import { AppRole } from './app-role';

@Injectable()
export class UserService {

  private TAG = 'UserService - ';

  private baseUrl = 'http://sarlacc-svc.voget.io'

  private tokenUrl = this.baseUrl + '/oauth/token';
  private userUrl = this.baseUrl + '/user-details';
  private appRoleUrl = this.baseUrl + '/app-role/';

  private user: User;

  public LOGIN_BCAST = 'LOGIN';
  public LOGOUT_BCAST = 'LOGOUT';
  
  constructor(
    private http: Http,
    private cookieService: CookieService,
    private broadcaster: Broadcaster
  ){}


  // Public Methods ================================================
  returnUser(): Promise<User> {

    console.info(this.TAG + 'Initializing the user service');

    return new Promise<{}>((resolve, reject) => {

      if (this.user && this.user.token && this.user.appRoles){
        console.debug(this.TAG + 'User, token, and app roles are already set.');
        resolve(this.user);
      }

      let accessToken = this.getTokenFromCookie();

      if (accessToken) {

        // TODO: use this access token to get token details
        let token: Token = new Token();
        token.access_token = accessToken;

        console.debug(this.TAG + 'Attempting to get user details with the access token');
        this.retrieveUser(accessToken)
        .then((user:User) => {

          console.debug(this.TAG + 'Attempting to get user app roles');
          this.getUserAppRoles(user.username, accessToken)
          .then((appRoles:AppRole[]) => {

            this.user = user;
            this.user.token = token;
            this.user.appRoles = appRoles;

            console.info(this.TAG + 'Intialization completed... User and token are both set');
            
            resolve(this.user);

          }).catch((err:any) => {
            this.logout();
            console.info(this.TAG + 'Initialization complete. No user logged in');
            reject();
          });

        }).catch((error:any) => {
          this.logout();
          console.info(this.TAG + 'Initialization complete. No user logged in');
          reject();
        });
      } else {
        console.info(this.TAG + 'Initialization complete. No user logged in');
        reject();
      }
    });
  }

  login(creds: any): Promise<User> {
    console.info(this.TAG + 'User logging in with username ' + creds.username);
    console.debug(this.TAG + 'Attempting to obtain an access token');

    return new Promise((resolve, reject) => {

      this.retrieveToken(creds)
      .then((token:Token) => {

        this.putTokenInCookie(token);

        console.debug(this.TAG + 'Attempting to get user details with the access token');
        this.retrieveUser(token.access_token)
        .then((user:User) => {


          console.debug(this.TAG + 'Attempting to get user app roles');
          this.getUserAppRoles(user.username, token.access_token)
          .then((appRoles:AppRole[]) => {

            this.user = user;
            this.user.token = token;
            this.user.appRoles = appRoles;

            console.info(this.TAG + 'Login successful');

            this.broadcastLogin('User ' + this.user.username + ' has logged in!');
            
            resolve(this.user);

          }).catch((error:any) => {
            this.logout();
            console.info(this.TAG + 'Login failed');
            reject(error);
          });

        }).catch((error:any) => {
          console.info(this.TAG + 'Login failed');
          this.logout();
          reject(error);
        });
      }).catch((error:any) => {
        console.info(this.TAG + 'Login failed');
        this.logout();
        reject(error);
      });

    });
  }

  logout(): void {
    console.info(this.TAG + 'Logging the user out');
    this.removeTokenFromCookie();
    this.user = null;
    this.broadcastLogout('User has logged out!');
  }

  getAuthHeaders(): Headers {
    if (this.user && this.user.token) {
      return new Headers({
        'Content-Type'   : 'application/json',
        'x-access-token'  : this.user.token.access_token
      });
    } else {
      return null;
    }
  }

  getUserAuthHeaders(): Headers {
    if (this.user && this.user.token) {
      return this.getUserHeaders(this.user.token.access_token);
    } else {
      return null;
    }
  }

  getTokenFromCookie(): string {
    console.debug(this.TAG + 'Checking if the browser has the access-token cookie');
    var access_token = this.cookieService.get('access-token');
    if (access_token) {
      console.debug(this.TAG + 'Found the following value in the access-token cookie: ' + access_token);
      return access_token;
    } else {
      console.debug(this.TAG + 'No access-token cookie found');
      return null;
    }
  }

  removeTokenFromCookie(): void {
    console.debug(this.TAG + 'Removing the access-token cookie');
    this.cookieService.remove('access-token');
  }

  putTokenInCookie(token:Token): void {
    console.debug(this.TAG + 'Putting the following value in the access-token cookie: ' + token.access_token);
    this.cookieService.put('access-token',token.access_token);
  }

  clearUser(): void {
    console.debug(this.TAG + 'Clearing the user!');
    this.user = null;
  }

  getAppRoles(): AppRole[] {
    if (this.user && this.user.appRoles) {
      return this.user.appRoles;
    } else {
      return null;
    }
  }

  getRoleForApp(appName:string): string {
    if (this.user && this.user.appRoles) {
      for (let appRole of this.user.appRoles){
        if (appRole.appName === appName){
          return appRole.role;
        }
      }
      return null;
    } else {
      return null;
    }
  }

  isAdminForApp(appName:string): boolean {
    return (this.getRoleForApp(appName) === 'ADMIN');
  }
  
  // Private Methods ================================================

  private retrieveUser(accessToken:string): Promise<User> {
    return new Promise<{}>((resolve, reject) => {
      this.http.post(this.userUrl, {}, {headers: this.getUserHeaders(accessToken)})
        .toPromise()
        .then((res:any) => {
          var user = res.json();
          console.debug(this.TAG + 'Successfully got a user with username: ' + user.username);
          console.debug(this.TAG + 'Full user details: ' + JSON.stringify(user));
          resolve(user);
        }).catch((res:any) => {
          var error = res.json();
          console.warn(this.TAG + 'Failed to retrieve a user with access token: ' + accessToken);
          console.debug(this.TAG + 'Error from the server: ' + JSON.stringify(error));
          reject(this.resolveError(error));
        });
    });
  }

  private retrieveToken(creds:any): Promise<Token> {

    creds.grant_type = 'password';
    let body = `username=${creds.username}&password=${creds.password}&grant_type=${creds.grant_type}`;

    return new Promise<{}>((resolve, reject) => {
      this.http.post(this.tokenUrl, body, {headers: this.getTokenHeaders()})
      .toPromise()
      .then((res:any) => {
        var token = res.json();
        console.debug(this.TAG + 'Successfully retrieved an access token: ' + token.access_token);
        console.debug(this.TAG + 'Full token details: ' + JSON.stringify(token));
        resolve(token);
      }).catch((res:any) => {
        var error = res.json();
        console.warn(this.TAG + 'Failed to retrieve an access token');
        console.debug(this.TAG + 'Error from the server: ' + JSON.stringify(error));
        reject(this.resolveError(error));
      });
    });
  }

  private resolveError(error:any): string {
    var message = 'Unknown error occurred';
    if (error.status === 404){
      message = 'Failed to connect to the Sarlacc';
    }
    if (error.error === 'invalid_token') {
      message = 'Invalid or bad token provided';
    }
    if (error.error === 'invalid_grant' || error.error === 'unauthorized'){
      message = 'Incorrect username or password';
    }
    console.debug(this.TAG + 'Resolved error: ' + message);
    return message;
  }

  private broadcastLogin(message:string): void {
    this.broadcaster.broadcast(this.LOGIN_BCAST,message);
  }

  private broadcastLogout(message:string): void {
    this.broadcaster.broadcast(this.LOGOUT_BCAST,message);
  }

  private getUserHeaders(accessToken:string): Headers {
    return new Headers({
      'Authorization'  : 'Bearer ' + accessToken
    });
  }

  private getTokenHeaders(): Headers {
    return new Headers({
      'Content-Type'   : 'application/x-www-form-urlencoded',
      'Authorization'  : 'Basic ' + btoa('sarlacc:deywannawanga')
    });
  } 

  private getUserAppRoles(username:string, accessToken:string): Promise<AppRole[]> {
    return new Promise<{}>((resolve, reject) => {
      this.http.get(this.appRoleUrl + username + '/', {headers: this.getUserHeaders(accessToken)})
      .toPromise()
      .then((res:any) => {
        let appRoles = res.json();
        console.debug(this.TAG + 'Successfully got app roles for username: ' + username);
        console.debug(this.TAG + 'User has the following app roles: ' + JSON.stringify(appRoles));
        resolve(appRoles);
      }).catch((err:any) => {
        var error = err.json();
        console.warn(this.TAG + 'Failed to get user app roles for username: ' + username);
        console.debug(this.TAG + 'Error from the server: ' + JSON.stringify(error));
        reject(this.resolveError(error));
      });
    })
  }

}