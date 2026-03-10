import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ingredient } from '../../models/ingredient';
import { IngredientService } from '../../services/ingredient.service';
import { FormsModule } from '@angular/forms'; // À AJOUTER
@Component({
  selector: 'app-ingredients-manager-page',
  templateUrl: './ingredients-manager-page.html',
  styleUrl: './ingredients-manager-page.css',
  imports: [CommonModule, FormsModule], // AJOUTER FormsModule pour le [(ngModel)]
})
export class IngredientsManagerPage implements OnInit {
  public ingredients: Ingredient[] = [];

  // Objet temporaire pour l'ajout ou la modification
  public ingredientSelectionne: Ingredient | null = null;
  constructor(private ingredientService: IngredientService) { }
  ngOnInit(): void {
    this.getIngredients();
  }
  getIngredients(): void {
    this.ingredientService.getIngredients().subscribe({
      next: (data) => this.ingredients = data,
      error: (err) => console.error("Erreur API : ", err)
    });
  }
  /** Préparer l'ajout d'un nouvel ingrédient (ligne vide) */
  creerNouvelIngredient(): void {
    this.ingredientSelectionne = {
      id: 0, nom: '', sapo: 0, ins: 0, iode: 0,
      volMousse: 0, tenueMousse: 0, douceur: 0,
      lavant: 0, durete: 0, solubilite: 0, sechage: 0,
      estCorpsGras: true
    };
  }
  /** Lancer l'édition d'une ligne existante */
  editerIngredient(item: Ingredient): void {
    // On crée une copie pour éviter de modifier le tableau original avant validation
    this.ingredientSelectionne = { ...item };
  }
  /** Enregistrer (Ajout ou Update) */
  saveIngredient(): void {
    if (!this.ingredientSelectionne) return; const action = this.ingredientSelectionne.id === 0
      ? this.ingredientService.addIngredient(this.ingredientSelectionne)
      : this.ingredientService.updateIngredient(this.ingredientSelectionne);
    action.subscribe({
      next: () => {
        this.ingredientSelectionne = null;
        this.getIngredients(); // Rafraîchir la liste
      }
    });
  }
  /** Supprimer un ingrédient */
  deleteIngredient(id: number): void {
    if (confirm("Supprimer cet ingrédient ?")) {
      this.ingredientService.deleteIngredient(id).subscribe(() =>
        this.getIngredients());
    }
  }
}