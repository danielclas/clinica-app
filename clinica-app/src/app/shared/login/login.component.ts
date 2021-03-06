import { TranslationService } from 'src/app/translation.service';
import { AnimateGallery } from './../../animations';
import { NotifyService } from './../../services/notify.service';
import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [AnimateGallery]
})

export class LoginComponent implements OnInit {

  loading = false;
  submitted = false;
  form: FormGroup;
  state = 'fadeIn';
  containerState = '';

  users = ['admin@test.com', 'doctor@cinco.com', 'paciente@prueba.com'];
  index = 0;

  constructor(
      private notify: NotifyService,
      private formBuilder: FormBuilder,
      private router: Router,
      private auth: AuthenticationService,
      public ts: TranslationService
  ) {
  }

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  ngOnInit() {
    this.auth.SignOut();
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  signIn() {
    this.loading = true;

    this.auth.getSignInMethods(this.email.value).then(
      res => {
        if(res.length > 0){
          this.auth.signIn(this.email.value, this.password.value).then(
            res => {
              this.state = 'fadeOut';
              setTimeout(() => {
                this.router.navigateByUrl('/home');
              }, 500);

              this.loading = false;
            },
            err => {
              this.notify.toastNotify('Error realizando el login', 'Hubo un error intentando ingresar a su cuenta. Intente más tarde');
              this.loading = false;
            }
          )
        }else{
          this.notify.toastNotify('Usuario inexistente', 'No existe un usuario con el correo <b>' + this.email.value + '</b>');
          this.loading = false;
        }
      }
    )
  }

  navigateToRegister(){
    this.containerState = 'fadeOut';
    setTimeout(() => {
      this.router.navigateByUrl('/register');
    }, 500);
  }

  autocomplete(){
    this.index = this.index == 2 ? 0 : this.index + 1,
    this.email.setValue(this.users[this.index])
    this.password.setValue('123456');
  }
}
