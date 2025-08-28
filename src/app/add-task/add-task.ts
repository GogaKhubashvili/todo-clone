import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="title" (ngSubmit)="submitTask()">
      <input
        type="text"
        placeholder="Add Task"
        [(ngModel)]="taskTitle"
        name="taskTitle"
      />
      <button type="submit">Add Task</button>
    </form>
  `,
  styleUrl: './add-task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTaskComponent {
  taskTitle = '';
  @Output() onAddTask = new EventEmitter<string>();

  submitTask() {
    this.onAddTask.emit(this.taskTitle);
    this.taskTitle = '';
  }
}
