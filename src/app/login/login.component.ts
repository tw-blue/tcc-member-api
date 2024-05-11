import { Component, inject } from '@angular/core';
import { Auth, User, authState, idToken, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseError } from '@angular/fire/app';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class AuthComponent {
  private auth: Auth = inject(Auth);
  user$ = user(this.auth);
  userSubscription: Subscription;
  authState$ = authState(this.auth);
  authStateSubscription: Subscription;
  idToken$ = idToken(this.auth);
  idTokenSubscription: Subscription;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });


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

  async onSubmit() {
    const email = this.loginForm.controls['email'].value;
    const pass = this.loginForm.controls['password'].value;
    if (email && pass) {
      try {
        const credential = await signInWithEmailAndPassword(this.auth, email, pass);
        console.log("Credential:");
        console.dir(credential);
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.log(`Failed login attempt:${e.code}`);
        } else {
          console.error("Unknown error:");
          console.error(e);
        }

      }
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.authStateSubscription.unsubscribe();
    this.idTokenSubscription.unsubscribe();
  }
}
