import { Component, Input } from '@angular/core';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskService } from '../shared/task-service';

@Component({
  selector: 'app-single-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    // NgClass
  ],
  templateUrl: './single-task.html',
  styleUrls: ['./single-task.scss'],
})
export class SingleTaskComponent {
  @Input() task!: Task;
  @Input() index!: string; // template passes index as interpolation
  @Input() list!: string; // 'tasks' | 'todayTasks' | 'section'
  @Input() sectionIndex?: number; // only set when list === 'section'

  constructor(public tasksSrv: TaskService) {}

  get idx() {
    return parseInt(this.index + '', 10);
  }

  onDragStart() {
    if (
      this.list === "'tasks'" ||
      this.list === 'tasks' ||
      this.list === '"tasks"'
    ) {
      this.tasksSrv.onDragStart(this.idx, 'tasks');
    } else if (
      this.list === "'todayTasks'" ||
      this.list === 'todayTasks' ||
      this.list === '"todayTasks"'
    ) {
      this.tasksSrv.onDragStart(this.idx, 'todayTasks');
    } else {
      // section
      const si = this.sectionIndex ?? 0;
      this.tasksSrv.onDragStartFromSection(this.idx, si);
    }
  }

  // wrappers to call service methods depending on list
  toggleMark() {
    if (this.list.includes('tasks') && this.list.includes('today')) {
      // should not happen
    }
    if (this.list.includes('tasks') && this.list === "'tasks'") {
      this.tasksSrv.makeDeleteVisible(this.idx);
    } else if (this.list.includes('today') || this.list === "'todayTasks'") {
      this.tasksSrv.makeDeleteVisibleToday(this.idx);
    } else if (this.list === "'section'" || this.list === 'section') {
      this.tasksSrv.makeDeleteVisibleAddedSection(this.sectionIndex!, this.idx);
    }
  }

  delete() {
    if (this.list === "'tasks'" || this.list === 'tasks') {
      this.tasksSrv.deleteTask(this.idx);
    } else if (this.list === "'todayTasks'" || this.list === 'todayTasks') {
      this.tasksSrv.deleteTaskToday(this.idx);
    } else {
      this.tasksSrv.deleteTaskFromSection(this.sectionIndex!, this.idx);
    }
  }

  edit() {
    if (this.list === "'tasks'" || this.list === 'tasks') {
      this.tasksSrv.editTask(this.idx);
    } else if (this.list === "'todayTasks'" || this.list === 'todayTasks') {
      this.tasksSrv.editTaskToday(this.idx);
    } else {
      this.tasksSrv.editTaskFromSection(this.sectionIndex!, this.idx);
    }
  }

  save() {
    if (this.list === "'tasks'" || this.list === 'tasks') {
      this.tasksSrv.saveTask(this.idx);
    } else if (this.list === "'todayTasks'" || this.list === 'todayTasks') {
      this.tasksSrv.saveTaskToday(this.idx);
    } else {
      this.tasksSrv.saveTaskFromSection(this.sectionIndex!, this.idx);
    }
  }
}
