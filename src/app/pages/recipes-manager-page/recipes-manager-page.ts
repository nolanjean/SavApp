import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Recette } from '../../models/recette';
import { RecetteService } from '../../services/recette.service';
import { RadarChartComponent } from '../../components/radar-chart/radar-chart';

@Component({
  selector: 'app-recipes-manager-page',
  imports: [CommonModule, RadarChartComponent],
  templateUrl: './recipes-manager-page.html',
  styleUrl: './recipes-manager-page.css',
})
export class RecipesManagerPage implements OnInit {

  public recettes: Recette[] = [];
  public recetteSelectionnee: Recette | null = null;

  constructor(private recetteService: RecetteService) { }

  ngOnInit(): void {
    this.chargerRecettes();
  }

  chargerRecettes(): void {
    this.recetteService.getAllRecettes().subscribe({
      next: (data) => this.recettes = data,
      error: (err) => console.error("Erreur API", err)
    });
  }

  voirDetails(recette: Recette): void {
    this.recetteService.getRecetteById(recette.id).subscribe({
      next: (data) => this.recetteSelectionnee = data,
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
