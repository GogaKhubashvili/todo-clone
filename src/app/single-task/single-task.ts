import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Task } from '../shared/task-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-task',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div
      class="task-div"
      [draggable]="true"
      (dragstart)="onDragStart.emit($event)"
      (dblclick)="toggleEditing()"
    >
      <div class="circle" (click)="toggleMarked.emit()">
        @if (task.isMarked) {
        <img src="assets/mark.png" alt="mark" class="mark" />
        }
      </div>

      <div class="task">
        @if (!task.isEditing) {
        <p [style.textDecoration]="task.isMarked ? 'line-through' : 'none'">
          {{ task.title }}
        </p>
        } @else {
        <input
          type="text"
          class="task-edit"
          [(ngModel)]="editableTitle"
          (blur)="saveChanges()"
          (keyup.enter)="saveChanges()"
          #editInput
        />
        }
      </div>

      @if (!task.isEditing) {
      <button class="edit" (click)="toggleEditing()">
        <img src="assets/edit.png" alt="edit" />
      </button>
      @if (task.isMarked) {
      <button class="delete" (click)="onDelete.emit()">
        <img src="assets/delete.png" alt="delete" />
      </button>
      } } @else {
      <button class="save" (click)="saveChanges()">
        <img src="assets/save.png" alt="save" />
      </button>
      }
    </div>
  `,
  styleUrl: './single-task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleTaskComponent {
  @Input({ required: true }) task!: Task;
  @Output() toggleMarked = new EventEmitter<void>();
  @Output() onDragStart = new EventEmitter<DragEvent>();
  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<void>();

  editableTitle = signal('');

  ngOnInit() {
    this.editableTitle.set(this.task.title);
  }

  toggleEditing() {
    this.task.isEditing = !this.task.isEditing;
  }

  saveChanges() {
    this.task.isEditing = false;
    this.onEdit.emit(this.editableTitle());
  }
}
