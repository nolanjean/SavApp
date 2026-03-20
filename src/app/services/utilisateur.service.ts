import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private readonly API_URL = 'http://localhost:8080/api-savon/v1/utilisateur';

  constructor(private http: HttpClient) { }

  /**
   * Recupere la liste de tous les utilisateurs inscrits.
   */
  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.API_URL);
  }

  /**
   * Recupere un utilisateur par son identifiant.
   */
  getUtilisateurById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.API_URL}/${id}`);
  }
}
