import { Component } from '@angular/core';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../shared/task-service';
import { SingleTaskComponent } from '../single-task/single-task';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    // NgClass,
    SingleTaskComponent,
  ],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.scss'],
})
export class AddTaskComponent {
  constructor(public tasksSrv: TaskService) {}

  onDragStart(i: number, from: string) {
    this.tasksSrv.onDragStart(i, from);
  }

  onDragOver(e: DragEvent) {
    this.tasksSrv.onDragOver(e);
  }

  getDropIndex(e: DragEvent, listName: 'tasks' | 'todayTasks') {
    return this.tasksSrv.getDropIndex(e, listName);
  }

  dropToMain(e: DragEvent) {
    const idx = this.tasksSrv.getDropIndex(e, 'tasks');
    this.tasksSrv.dropTaskToMainList('tasks', idx);
  }
}
