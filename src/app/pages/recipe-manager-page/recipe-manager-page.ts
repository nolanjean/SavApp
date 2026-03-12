import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Recette } from '../../models/recette';
import { RecetteService } from '../../services/recette.service';
@Component({
  selector: 'app-recettes-manager-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-manager-page.html',
  styleUrl: './recipe-manager-page.css'
})
export class RecipeManagerPage implements OnInit {
  public recettes: Recette[] = [];
  public recetteSelectionnee: Recette | null = null;
  constructor(private recetteService: RecetteService) { }
  ngOnInit(): void {
    this.chargerRecettes();
  }
  chargerRecettes(): void {
    this.recetteService.getRecettes().subscribe({
      next: (data) => this.recettes = data,
      error: (err) => console.error("Erreur API", err)
    });
  }
  voirDetails(recette: Recette): void {
    this.recetteService.getRecetteById(recette.id).subscribe({
      next: (data) => {
        console.log('Recette complète :', JSON.stringify(data, null, 2));
        this.recetteSelectionnee = data;
      },
      error: (err) => console.error('Erreur chargement détails recette :', err)
    });
  }
  supprimerRecette(id: number): void {
    if (confirm("Supprimer cette recette ?")) {
      this.recetteService.deleteRecette(id).subscribe(() => {
        if (this.recetteSelectionnee?.id === id) this.recetteSelectionnee = null;
        this.chargerRecettes();
      });
    }
  }
}