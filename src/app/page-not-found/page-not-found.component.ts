import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [MatButtonModule, NgIf, RouterModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {
  auth: Auth = inject(Auth);
  authState$ = authState(this.auth);
  authStateSubscription: Subscription;

  loggedIn = false;

  constructor() {
    this.authStateSubscription = this.authState$.subscribe(aUser => this.loggedIn = aUser ? true : false)
  }
  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }
}
