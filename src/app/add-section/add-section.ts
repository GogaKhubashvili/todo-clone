import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { Section, Task, TaskService } from '../shared/task-service';
import { FormsModule } from '@angular/forms';
import { SingleTaskComponent } from '../single-task/single-task';

@Component({
  selector: 'app-add-section',
  standalone: true,
  imports: [FormsModule, SingleTaskComponent],
  template: `
    @if (!section().collapsed) {
    <section
      class="sec-2"
      [style.background-color]="section().color"
      (drop)="onDrop.emit($event)"
      (dragover)="onDragOver.emit($event)"
    >
      <div class="section-header">
        @if (!section().isTitleEditing) {
        <h2 class="title" (dblclick)="toggleTitleEditing()">
          {{ section().title }}
        </h2>
        } @else {
        <input
          type="text"
          class="title-edit"
          [(ngModel)]="sectionTitle"
          (blur)="changeTitle()"
        />
        } @if (!section().collapsed) {
        <div class="size">
          <img src="assets/arrow-circle-fill.png" alt="arrow" />
        </div>
        <p class="tasks-num">({{ section().tasks.length }})</p>
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

      <form class="title title-form" (ngSubmit)="submitTask()">
        <input
          type="text"
          placeholder="Add task"
          [(ngModel)]="taskTitle"
          name="taskTitle"
        />
        <button type="submit">Add</button>
      </form>

      @for (task of section().tasks; track task.id) {
      <app-single-task
        [task]="task"
        (toggleMarked)="toggleMarked(task)"
        (onDelete)="onDeleteTask(task)"
        (onDragStart)="onDragStart($event, task.id)"
        (onEdit)="updateTaskTitle(task, $event)"
      ></app-single-task>
      }

      <button class="paint" (click)="toggleColorChange()">
        <img src="assets/paint-brush.png" alt="paint brush" />
      </button>

      @if (section().isColorChanging) {
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
    } @else {
    <div class="hidden-section" (click)="toggleCollapsed()">
      <h3 class="title-text">{{ section().title }}</h3>
      <p class="tasks-num">({{ section().tasks.length }})</p>
      <div class="zoom" (click)="toggleTitleEditing()">
        <img src="assets/zoom.png" alt="zoom" />
      </div>
      <button class="delete-section" (click)="onDeleteSection.emit()">
        <img src="assets/delete.png" alt="delete" />
      </button>
    </div>
    }
  `,
  styleUrl: './add-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSectionComponent {
  section = input<Section>({
    id: '',
    title: '',
    tasks: [],
    collapsed: false,
    isTitleEditing: false,
    isColorChanging: false,
    color: 'rgb(19, 17, 60)',
  });
  onDrop = output<DragEvent>();
  onDragOver = output<DragEvent>();
  onDeleteSection = output<void>();
  onColorChange = output<string>();

  taskTitle = '';
  sectionTitle = this.section().title;

  constructor(private taskService: TaskService) {}

  submitTask() {
    this.taskService.addTask(this.taskTitle, this.section().id);
    this.taskTitle = '';
  }

  toggleCollapsed() {
    this.section().collapsed = !this.section().collapsed;
  }

  toggleTitleEditing() {
    this.section().isTitleEditing = !this.section().isTitleEditing;
    this.sectionTitle = this.section().title;
  }

  updateTaskTitle(task: Task, newTitle: string) {
    task.title = newTitle;
  }

  changeTitle() {
    this.section().title = this.sectionTitle;
    this.section().isTitleEditing = false;
  }

  toggleColorChange() {
    this.section().isColorChanging = !this.section().isColorChanging;
  }

  toggleMarked(task: Task) {
    task.isMarked = !task.isMarked;
  }

  onDeleteTask(task: Task) {
    this.taskService.deleteTask(task.id, this.section().id);
  }

  onDragStart(event: DragEvent, taskId: string) {
    this.taskService.onDragStart(event, taskId, this.section().id);
  }
}
