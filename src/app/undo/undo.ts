import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Task } from '../shared/task-service';

@Component({
  selector: 'app-undo',
  standalone: true,
  template: `
    @if (show) {
    <div class="undo">
      <p>Task Achieved!</p>
      <button (click)="onUndo.emit()">UNDO</button>
      <img
        src="assets/close.png"
        alt="close"
        class="close"
        (click)="show = false"
      />
      <img
        src="assets/info.png"
        alt="info"
        class="info"
        (click)="show = false"
      />
    </div>
    }
  `,
  styleUrl: './undo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoComponent {
  @Input() show: boolean = false;
  @Input() task: Task | null = null;
  @Output() onUndo = new EventEmitter<void>();
}
