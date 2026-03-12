import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Recette } from '../models/recette';
import { RecetteFormDTO } from '../models/dto';
@Injectable({
  providedIn: 'root'
})
export class RecetteService {
  private readonly API_URL_RECETTE = 'http://localhost:8080/api-savon/v1/recette';
  constructor(private http: HttpClient) { }
  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(this.API_URL_RECETTE);
  }
  getRecetteById(id: number): Observable<Recette> {
    return this.http.get<Recette>(`${this.API_URL_RECETTE}/${id}`);
  }
  deleteRecette(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL_RECETTE}/${id}`);
  }

  /**
 * Enregistre une nouvelle recette.
 * @param recette - L'objet Recette à enregistrer.
 * @returns Un Observable contenant la recette enregistrée.
 */
  createRecette(recette: RecetteFormDTO): Observable<Recette> {
    return this.http.post<Recette>(this.API_URL_RECETTE, recette);
  }
}