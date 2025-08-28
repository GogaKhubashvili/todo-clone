import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { Task, TaskService } from '../shared/task-service';
import { SingleTaskComponent } from '../single-task/single-task';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [SingleTaskComponent, FormsModule],
  template: `
    <section
      class="sec-1"
      [style.background-color]="color()"
      (drop)="onDrop.emit($event)"
      (dragover)="onDragOver.emit($event)"
    >
      <div class="section-header">
        @if (!isTitleEditing()) {
        <h2 class="title">Today</h2>
        } @else {
        <input
          type="text"
          class="title-edit"
          [(ngModel)]="newTitle"
          (blur)="changeTitle()"
        />
        } @if (!collapsed()) {
        <div class="size">
          <img src="assets/arrow-circle-fill.png" alt="arrow" />
        </div>
        <p class="tasks-num">({{ tasks().length }})</p>
        }

        <button class="delete-section" (click)="onDeleteSection.emit()">
          <img src="assets/delete.png" alt="delete" />
        </button>
        <button class="hide" (click)="toggleCollapsed()">
          <img src="assets/hide.png" alt="hide" />
        </button>
        <button class="zoom" (click)="toggleTitleEditing()">
          <img src="assets/zoom.png" alt="zoom" />
        </button>
      </div>

      @if (!collapsed()) { @for (task of tasks(); track task.id) {
      <app-single-task
        [task]="task"
        (toggleMarked)="toggleMarked(task)"
        (onDelete)="onDeleteTask(task)"
        (onDragStart)="onDragStart($event, task.id)"
        (onEdit)="updateTaskTitle(task, $event)"
      ></app-single-task>
      } }

      <button class="paint" (click)="toggleColorChange()">
        <img src="assets/paint-brush.png" alt="paint brush" />
      </button>

      @if (isColorChanging()) {
      <div class="color-change">
        <div class="colors">
          <div
            class="single-color red"
            (click)="onColorChange.emit('rgb(148, 17, 7)')"
          ></div>
          <div
            class="single-color orange"
            (click)="onColorChange.emit('rgb(201, 129, 6)')"
          ></div>
          <div
            class="single-color yellow"
            (click)="onColorChange.emit('rgb(195, 189, 17)')"
          ></div>
          <div
            class="single-color green"
            (click)="onColorChange.emit('rgb(4, 174, 103)')"
          ></div>
          <div
            class="single-color purple"
            (click)="onColorChange.emit('rgb(49, 5, 72)')"
          ></div>
          <div
            class="single-color blue"
            (click)="onColorChange.emit('rgb(19, 17, 60)')"
          ></div>
          <div
            class="single-color teal"
            (click)="onColorChange.emit('teal')"
          ></div>
          <div
            class="single-color cyan"
            (click)="onColorChange.emit('cyan')"
          ></div>
          <div
            class="single-color pink"
            (click)="onColorChange.emit('rgb(226, 159, 170)')"
          ></div>
          <div
            class="single-color black"
            (click)="onColorChange.emit('gray')"
          ></div>
        </div>
      </div>
      }
    </section>
  `,
  styleUrl: './today.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayComponent {
  tasks = input<Task[]>([]);
  color = input<string>('rgb(19, 17, 60)');
  onDrop = output<DragEvent>();
  onDragOver = output<DragEvent>();
  onDeleteSection = output<void>();
  onColorChange = output<string>();

  isTitleEditing = signal(false);
  isColorChanging = signal(false);
  collapsed = signal(false);
  newTitle = '';

  constructor(private taskService: TaskService) {}

  toggleCollapsed() {
    this.collapsed.update((value) => !value);
  }

  toggleTitleEditing() {
    this.isTitleEditing.update((value) => !value);
    this.newTitle = 'Today'; // Reset for now, can be stateful later
  }

  changeTitle() {
    this.isTitleEditing.set(false);
  }

  toggleColorChange() {
    this.isColorChanging.update((value) => !value);
  }

  toggleMarked(task: Task) {
    task.isMarked = !task.isMarked;
  }

  onDeleteTask(task: Task) {
    this.taskService.deleteTask(task.id, 'today');
  }

  updateTaskTitle(task: Task, newTitle: string) {
    task.title = newTitle;
  }

  onDragStart(event: DragEvent, taskId: string) {
    this.taskService.onDragStart(event, taskId, 'today');
  }
}
