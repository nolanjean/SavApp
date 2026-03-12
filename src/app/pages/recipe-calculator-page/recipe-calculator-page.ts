import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient';
import { LigneIngredient, Recette } from '../../models/recette';
import { LigneIngredientDTO, RecetteFormDTO } from '../../models/dto';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
@Component({
  selector: 'app-recipe-calculator-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './recipe-calculator-page.html',
  styleUrl: './recipe-calculator-page.css',
})
export class RecipeCalculatorPage implements OnInit {
  // Liste des ingrédients disponibles :
  public ingredientsDispo: Ingredient[] = [];
  // Ingrédients sélectionnés :
  public choixIngredient: Ingredient | null = null;
  public selectionIngredients: LigneIngredient[] = [];
  public masseTotale = 0;
  // Recette calculée (résultat retourné par le backend) :
  public recetteCalculee: Recette | null = null;
  // Nouvelle recette :
  public nouvelleRecetteDTO: RecetteFormDTO = {
    id: null,
    titre: '',
    description: '',
    surgraissage: 0,
    avecSoude: false,
    concentrationAlcalin: 0,
    ligneIngredients: []
  }// Injection des services par le constructeur :
  constructor(
    private ingredientService: IngredientService,
    private recetteService: RecetteService
  ) { }
  // Initialisation : Récupération de la liste des ingrédients via l'API :
  ngOnInit(): void {
    this.ingredientService.getIngredients().subscribe(data =>
      this.ingredientsDispo = data);
  }
  /**
  * Ajoute une ligne ingrédient à la recette
  */
  ajouterIngredient(): void {
    // Refus des doublons :i
    if (this.choixIngredient && this.selectionIngredients.find(l =>
      l.ingredient.id === this.choixIngredient?.id)) {
      return;
    }
    // Ajout de la ligneIngredient :
    this.selectionIngredients.push({
      ingredient: this.choixIngredient!,
      quantite: 0,
      pourcentage: 0
    })
    // Optionnel : Réinitialiser le menu déroulant après l'ajout
    this.choixIngredient = null;
  }
  /**
  * Recalcule les pourcentages
  */
  recalculerPourcentages(): void {
    this.masseTotale = this.selectionIngredients.reduce((acc, ligne) => acc +
      ligne.quantite, 0); // Somme des masse des ingrédients de la recette

    this.selectionIngredients.forEach(ligne => {
      ligne.pourcentage = this.masseTotale > 0 ? + (ligne.quantite /
        this.masseTotale * 100).toFixed(0) : 0; // Calcul les pourcentages des ingrédients
    });

  }
 /**
 * Supprime un ingrédient préalablement choisi pour la recette en cours
 * @param index
 */supprimerIngredient(index: number): void {
    this.selectionIngredients.splice(index, 1);
  }

  /**
  * Méthode de soumission du nouvel ingrédient
  */
  onSubmit(): void {
    // 1. Associer les ingrédients à ligneIngredientDTO :
    const ligneIngredientDTOs = this.selectionIngredients.map(ligne => ({
      quantite: ligne.quantite,
      pourcentage: ligne.pourcentage,
      ingredientId: ligne.ingredient?.id ?? 0
    }));
    console.log(`LigneIngredientDTOs = `, ligneIngredientDTOs);
    // 2. Finalisation de l'objet RecetteFormDTO :
    const recetteEnvoyee: RecetteFormDTO = {
      ...this.nouvelleRecetteDTO,
      ligneIngredients: ligneIngredientDTOs
    };
    console.log('Objet RecetteDTO prêt à envoyer :', recetteEnvoyee);

    // 3. Envoi de la recette à l'API via le service recette :
    this.recetteService.createRecette(recetteEnvoyee).subscribe({
      next: (recette: Recette) => {
        console.log('Recette reçue du backend :', recette);
        this.recetteCalculee = recette;
      },
      error: (err) => {
        console.error('Erreur lors de la création de la recette :', err);
      }
    });
  }
}