import { Component } from '@angular/core';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../shared/task-service';
import { SingleTaskComponent } from '../single-task/single-task';

@Component({
  selector: 'app-add-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    // NgClass,
    SingleTaskComponent,
  ],
  templateUrl: './add-section.html',
  styleUrls: ['./add-section.scss'],
})
export class AddSectionComponent {
  constructor(public tasksSrv: TaskService) {}

  onDragOver(e: DragEvent) {
    this.tasksSrv.onDragOver(e);
  }

  dropToSection(e: DragEvent, sectionIndex: number) {
    const idx = this.tasksSrv.getDropIndex(e, 'section', sectionIndex);
    this.tasksSrv.dropTaskToSection(sectionIndex, idx);
  }

  addTaskToSection(index: number) {
    this.tasksSrv.addTaskToSection(index);
  }

  onDragStartFromSection(taskIndex: number, sectionIndex: number) {
    this.tasksSrv.onDragStartFromSection(taskIndex, sectionIndex);
  }
}
