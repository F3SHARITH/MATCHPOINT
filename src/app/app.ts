import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaDeporteService } from './core/tema/tema-deporte.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('matchpoint');

  constructor() {
    // Se crea aquí para que el color por deporte funcione en toda la app desde el inicio.
    inject(TemaDeporteService);
  }
}
