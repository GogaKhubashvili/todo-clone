import { Component } from '@angular/core';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../shared/task-service';
import { SingleTaskComponent } from '../single-task/single-task';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    // NgClass,
    SingleTaskComponent,
  ],
  templateUrl: './today.html',
  styleUrls: ['./today.scss'],
})
export class TodayComponent {
  constructor(public tasksSrv: TaskService) {}

  onDragStart(i: number, from: string) {
    this.tasksSrv.onDragStart(i, from);
  }

  onDragOver(e: DragEvent) {
    this.tasksSrv.onDragOver(e);
  }
}
