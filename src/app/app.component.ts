import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, User, authState } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { logOut } from './util/authutil';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tcc-member-db';
  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  authState$ = authState(this.auth);
  authStateSubscription: Subscription;
  loggedIn = false;

  constructor() {
    this.authStateSubscription = this.authState$.subscribe(aUser => this.loggedIn = aUser ? true : false)
  }
  onLogOut() {
    logOut(this.auth);
  }
  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }
}

