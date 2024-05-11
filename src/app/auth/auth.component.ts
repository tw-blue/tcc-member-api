import { Component, inject } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, idToken, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  private auth: Auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription: Subscription;
  authState$ = authState(this.auth);
  authStateSubscription: Subscription;
  idToken$ = idToken(this.auth);
  idTokenSubscription: Subscription;

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      console.log("User:");
      console.log(aUser);
    });
    this.authStateSubscription = this.authState$.subscribe((aUser: User | null) => {
      console.log("Auth State:");
      console.log(aUser);
    })
    this.idTokenSubscription = this.idToken$.subscribe((token: string | null) => {
      console.log("ID Token:");
      console.log(token);
    })

    /*createUserWithEmailAndPassword(this.auth, email, password);
    signInWithEmailAndPassword(this.auth, email, password);
    fetchSignInMethodsForEmail(this.auth, email);*/
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.authStateSubscription.unsubscribe();
    this.idTokenSubscription.unsubscribe();
  }
}
