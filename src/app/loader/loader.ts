import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader">
      <div class="spin-1"></div>
      <div class="spin-2"></div>
      <div class="spin-3"></div>
    </div>
  `,
  styleUrl: './loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {}
