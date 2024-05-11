import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from '@angular/fire/auth';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

const UPPER_REGEX: RegExp = new RegExp('[A-Z]');
const LOWER_REGEX: RegExp = new RegExp('[a-z]');
const DIGIT_REGEX: RegExp = new RegExp('[0-9]');
const CHAR_REGEX: RegExp = new RegExp('[^A-Za-z0-9]');

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgIf, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth: Auth = inject(Auth);
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(12), this.passwordPatternValidator()]),
    repeatPassword: new FormControl('', [Validators.required])
  }, [this.passwordEqualValidator()]);

  constructor(private router: Router) { }

  async registerUser() {
    const email = this.registerForm.controls['email'].value;
    const password = this.registerForm.controls['password'].value;
    const name = this.registerForm.controls['name'].value;
    if (email && password && name) {
      try {
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        if (credential.user) {
          await updateProfile(credential.user, { displayName: name });
          sendEmailVerification(credential.user);
          this.router.navigateByUrl('/home');
        } else {
          console.error("No user in credential");
          console.dir(credential);
        }
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.log("Error registering");
          console.log(e.code);
        } else {
          console.error("Unknown error");
          console.error(e);
        }
      }
    }
  }

  onSubmit() {
    this.registerUser();
  }

  passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let errors: ValidationErrors = {};
      let any = false;
      if (!UPPER_REGEX.test(control.value)) {
        errors['missing_upper'] = true;
        any = true;
      }
      if (!LOWER_REGEX.test(control.value)) {
        errors['missing_lower'] = true;
        any = true;
      }
      if (!DIGIT_REGEX.test(control.value)) {
        errors['missing_digit'] = true;
        any = true;
      }
      if (!CHAR_REGEX.test(control.value)) {
        errors['missing_char'] = true;
        any = true;
      }
      return any ? errors : null;
    };
  }

  passwordEqualValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')!.value;
      const repeat = control.get('repeatPassword')!.value;
      if (password === repeat) {
        control.get('repeatPassword')!.setErrors(null);
        return null;
      } else {
        control.get('repeatPassword')!.setErrors({ passwordNotEqual: true });
        return { passwordNotEqual: true };
      }
    };
  }
}
