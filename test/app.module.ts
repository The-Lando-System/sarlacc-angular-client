import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { TestComponent } from './test.component';

import { UserService } from '../src/user.service';
import { Broadcaster } from '../src/broadcaster';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [ TestComponent ],
  providers: [ CookieService, UserService, Broadcaster ],
  bootstrap: [ TestComponent ]
})
export class AppModule { }