import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Marca un SVG como seguro para usarlo con [innerHTML] (si no, Angular borra el <svg>).
 * Úsalo solo con íconos fijos escritos por nosotros, nunca con texto que escriban los usuarios.
 * Es un pipe puro: solo se recalcula cuando cambia el texto del SVG.
 */
@Pipe({ name: 'svgSeguro', standalone: true })
export class SvgSeguroPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
