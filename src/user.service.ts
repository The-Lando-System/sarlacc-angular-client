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

      if (this.user && this.user.token){
        console.debug(this.TAG + 'User and token are already set.');
        resolve(this.user);
      }

      let token = this.getTokenFromCookie();

      if (token) {
        console.debug(this.TAG + 'Attempting to get user details with the access token');
        this.retrieveUser(token)
        .then((user:User) => {

          console.debug(this.TAG + 'Attempting to get user app roles');
          this.getUserAppRoles(user.username, user.token.access_token)
          .then((appRoles:AppRole[]) => {
            console.debug(this.TAG + 'Setting the following app roles for user: ');
            console.debug(appRoles);

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
        this.retrieveUser(token)
        .then((user:User) => {


          console.debug(this.TAG + 'Attempting to get user app roles');
          this.getUserAppRoles(user.username, user.token.access_token)
          .then((appRoles:AppRole[]) => {

            console.info(this.TAG + 'Login successful');

            this.user = user;
            this.user.token = token;
            this.user.appRoles = appRoles;

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
    return new Headers({
      'Content-Type'   : 'application/json',
      'x-access-token'  : this.user.token.access_token
    });
  }

  getUserHeaders(accessToken:string): Headers {
    return new Headers({
      'Authorization'  : 'Bearer ' + accessToken
    });
  }

  getTokenFromCookie(): Token {
    console.debug(this.TAG + 'Checking if the browser has the access-token cookie');
    var access_token = this.cookieService.get('access-token');
    if (access_token) {
      console.debug(this.TAG + 'Found the following value in the access-token cookie: ' + access_token);
      var token: Token = new Token();
      token.access_token = access_token;
      return token;
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
  
  // Private Methods ================================================

  private retrieveUser(token:Token): Promise<User> {
    return new Promise<{}>((resolve, reject) => {
      this.http.post(this.userUrl, {}, {headers: this.getUserHeaders(token.access_token)})
        .toPromise()
        .then((res:any) => {
          var user = res.json();
          console.debug(this.TAG + 'Successfully got a user with username: ' + user.username);
          console.debug(this.TAG + 'Full user details: ' + JSON.stringify(user));
          resolve(user);
        }).catch((res:any) => {
          var error = res.json();
          console.warn(this.TAG + 'Failed to retrieve a user with access token: ' + token.access_token);
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