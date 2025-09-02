import { Component, Input } from '@angular/core';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Section, TaskService } from '../shared/task-service';
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
  // constructor(public tasksSrv: TaskService) {}

  // onDragOver(e: DragEvent) {
  //   this.tasksSrv.onDragOver(e);
  // }

  // dropToSection(e: DragEvent, sectionIndex: number) {
  //   const idx = this.tasksSrv.getDropIndex(e, 'section', sectionIndex);
  //   this.tasksSrv.dropTaskToSection(sectionIndex, idx);
  // }

  // addTaskToSection(index: number) {
  //   this.tasksSrv.addTaskToSection(index);
  // }

  // onDragStartFromSection(taskIndex: number, sectionIndex: number) {
  //   this.tasksSrv.onDragStartFromSection(taskIndex, sectionIndex);
  // }

  @Input() list!: Section;
  @Input() sectionIndex!: number;

  constructor(public tasksSrv: TaskService) {}

  dropToSection(event: DragEvent, sectionIndex: number) {
    const dropIndex = this.tasksSrv.getDropIndex(
      event,
      'section',
      sectionIndex
    );
    this.tasksSrv.dropTaskToSection(sectionIndex, dropIndex);
  }
}
