import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-manager-page',
  imports: [DatePipe],
  templateUrl: './account-manager-page.html',
  styleUrl: './account-manager-page.css',
})
export class AccountManagerPage {

  public authService = inject(AuthService);
  public now = new Date();

}
