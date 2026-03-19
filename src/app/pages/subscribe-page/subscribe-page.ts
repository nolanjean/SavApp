import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-subscribe-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './subscribe-page.html',
  styleUrl: './subscribe-page.css',
})
export class SubscribePage {

  form = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  cguAccepted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Validations côté client
    if (!this.form.username || !this.form.email || !this.form.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.cguAccepted) {
      this.errorMessage = 'Vous devez accepter les conditions d\'utilisation.';
      return;
    }

    this.loading = true;

    this.authService.register({
      username: this.form.username,
      email: this.form.email,
      password: this.form.password,
    }).subscribe({
      next: () => {
        this.successMessage = 'Compte créé avec succès ! Redirection vers la connexion...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.errorMessage = 'Un compte avec cet email existe déjà.';
        } else {
          this.errorMessage = 'Erreur lors de la création du compte. Veuillez réessayer.';
        }
        console.error('Erreur d\'inscription', err);
      }
    });
  }
}
