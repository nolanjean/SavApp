import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient';
import { LigneIngredient, Recette, Resultat } from '../../models/recette';
import { RecetteFormDTO } from '../../models/dto';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { AuthService } from '../../services/auth.service';
import { RadarChartComponent } from '../../components/radar-chart/radar-chart';
@Component({
  selector: 'app-recipe-calculator-page',
  imports: [FormsModule, CommonModule, RadarChartComponent],
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
  // Indique si la recette a été enregistrée en base :
  public recetteSauvegardee = false;
  // Nouvelle recette :
  public nouvelleRecetteDTO: RecetteFormDTO = {
    id: null,
    titre: '',
    description: '',
    surgraissage: 0,
    avecSoude: false,
    concentrationAlcalin: 0,
    ligneIngredients: []
  }
  // Injection des services par le constructeur :
  constructor(
    private ingredientService: IngredientService,
    private recetteService: RecetteService,
    public authService: AuthService
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
    // Refus des doublons :
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
      ligne.quantite, 0);

    this.selectionIngredients.forEach(ligne => {
      ligne.pourcentage = this.masseTotale > 0 ? + (ligne.quantite /
        this.masseTotale * 100).toFixed(0) : 0;
    });
  }
  /**
  * Supprime un ingrédient préalablement choisi pour la recette en cours
  */
  supprimerIngredient(index: number): void {
    this.selectionIngredients.splice(index, 1);
  }

  /**
  * Calcule la recette côté client (sans appel API)
  */
  onSubmit(): void {
    this.recetteSauvegardee = false;
    this.recalculerPourcentages();

    // Facteur de conversion KOH → NaOH (masses molaires : NaOH=40, KOH=56.1)
    const FACTEUR_NAOH = 40 / 56.1;
    const surgraissage = this.nouvelleRecetteDTO.surgraissage / 100;
    const concentration = this.nouvelleRecetteDTO.concentrationAlcalin / 100;

    // Calcul de la quantité d'alcali pur nécessaire :
    let alcaliPur = 0;
    this.selectionIngredients.forEach(ligne => {
      const sapo = ligne.ingredient.sapo / 1000; // mg → g
      if (this.nouvelleRecetteDTO.avecSoude) {
        alcaliPur += ligne.quantite * sapo * FACTEUR_NAOH;
      } else {
        alcaliPur += ligne.quantite * sapo;
      }
    });

    // Application du surgraissage :
    alcaliPur = alcaliPur * (1 - surgraissage);

    // Quantité de solution d'alcali et apport en eau :
    const qteAlcalin = concentration > 0 ? alcaliPur / concentration : 0;
    const apportEnEau = qteAlcalin - alcaliPur;

    // Calcul des caractéristiques (moyenne pondérée par pourcentage) :
    const caracteristiques: { id: number; nom: string; prop: keyof Ingredient }[] = [
      { id: 1, nom: 'Iode',             prop: 'iode' },
      { id: 2, nom: 'Indice INS',       prop: 'ins' },
      { id: 3, nom: 'Douceur',          prop: 'douceur' },
      { id: 4, nom: 'Lavant',           prop: 'lavant' },
      { id: 5, nom: 'Volume de mousse', prop: 'volMousse' },
      { id: 6, nom: 'Tenue de mousse',  prop: 'tenueMousse' },
      { id: 7, nom: 'Dureté',           prop: 'durete' },
      { id: 8, nom: 'Solubilité',       prop: 'solubilite' },
      { id: 9, nom: 'Séchage',          prop: 'sechage' },
    ];

    const resultats: Resultat[] = caracteristiques.map(c => {
      let score = 0;
      this.selectionIngredients.forEach(ligne => {
        score += (ligne.pourcentage / 100) * (ligne.ingredient[c.prop] as number);
      });
      return {
        score: +score.toFixed(3),
        caracteristique: { id: c.id, nom: c.nom },
      };
    });

    // Construction de l'objet Recette calculé localement :
    this.recetteCalculee = {
      id: 0,
      titre: this.nouvelleRecetteDTO.titre,
      description: this.nouvelleRecetteDTO.description,
      surgraissage: this.nouvelleRecetteDTO.surgraissage,
      apportEnEau: +apportEnEau.toFixed(3),
      avecSoude: this.nouvelleRecetteDTO.avecSoude,
      concentrationAlcalin: this.nouvelleRecetteDTO.concentrationAlcalin,
      qteAlcalin: +qteAlcalin.toFixed(3),
      ligneIngredients: this.selectionIngredients.map(l => ({ ...l })),
      resultats: resultats,
    };
  }

  /**
  * Enregistre la recette en base de données via l'API (utilisateur connecté uniquement)
  */
  sauvegarderRecette(): void {
    const ligneIngredientDTOs = this.selectionIngredients.map(ligne => ({
      quantite: ligne.quantite,
      pourcentage: ligne.pourcentage,
      ingredientId: ligne.ingredient?.id ?? 0
    }));

    const recetteEnvoyee: RecetteFormDTO = {
      ...this.nouvelleRecetteDTO,
      ligneIngredients: ligneIngredientDTOs
    };

    this.recetteService.createRecette(recetteEnvoyee).subscribe({
      next: (recette: Recette) => {
        this.recetteCalculee = recette;
        this.recetteSauvegardee = true;
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde de la recette :', err);
      }
    });
  }
}