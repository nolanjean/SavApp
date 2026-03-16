import { Component, Input, OnChanges, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Resultat } from '../../models/recette';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%; max-width: 400px; margin: 0 auto;">
      <canvas #radarCanvas width="400" height="400"></canvas>
    </div>
  `
})
export class RadarChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() resultats: Resultat[] = [];
  @ViewChild('radarCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.buildChart());
  }

  ngOnChanges(): void {
    setTimeout(() => this.buildChart());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.canvasRef?.nativeElement || !this.resultats?.length) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Exclure INS et Iode dont les échelles écrasent les autres caractéristiques
    const exclusions = ['ins', 'iode'];
    const filteredResultats = this.resultats.filter(
      r => !exclusions.some(ex => r.caracteristique.nom.toLowerCase().includes(ex))
    );
    if (!filteredResultats.length) return;

    const labels = filteredResultats.map(r => r.caracteristique.nom);
    const scores = filteredResultats.map(r => r.score);

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Score',
          data: scores,
          backgroundColor: 'rgba(25, 135, 84, 0.2)',
          borderColor: 'rgba(25, 135, 84, 1)',
          pointBackgroundColor: 'rgba(25, 135, 84, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(25, 135, 84, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            ticks: { stepSize: 10 },
            pointLabels: { font: { size: 13 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed.r.toFixed(1)}`
            }
          }
        }
      }
    });
  }
}
