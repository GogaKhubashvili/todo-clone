// import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { AddSectionComponent } from './add-section/add-section';
// import { AddTaskComponent } from './add-task/add-task';
// import { LoaderComponent } from './loader/loader';
// import { TodayComponent } from './today/today';
// import { TaskService, Task } from './shared/task-service';
// import { UndoComponent } from './undo/undo';
// import { SingleTaskComponent } from './single-task/single-task'; // Import the component here

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [
//     // RouterOutlet,
//     AddTaskComponent,
//     TodayComponent,
//     LoaderComponent,
//     UndoComponent,
//     AddSectionComponent,
//     SingleTaskComponent, // Add the component to the imports array
//   ],
//   template: `
//     @if (taskService.loader()) {
//     <app-loader></app-loader>
//     }
//     <main>
//       <section
//         class="sec-1"
//         [style.background-color]="sec1Color()"
//         (drop)="onDrop($event)"
//         (dragover)="onDragOver($event)"
//       >
//         @if (taskService.todayExist()) {
//         <app-today
//           [tasks]="taskService.todayTasks()"
//           [color]="secTodayColor()"
//           (onColorChange)="secTodayColor.set($event)"
//           (onDeleteSection)="taskService.deleteTodaySection()"
//           (onDrop)="taskService.onDrop($event, 'today')"
//           (onDragOver)="taskService.onDragOver($event)"
//         ></app-today>
//         }
//         <app-add-task (onAddTask)="addTask($event)"></app-add-task>

//         @for (task of taskService.tasks(); track task.id) {
//         <app-single-task
//           [task]="task"
//           (toggleMarked)="toggleMarked(task)"
//           (onDelete)="onDeleteTask(task)"
//           (onEdit)="updateTaskTitle(task, $event)"
//           (onDragStart)="onDragStart($event, task.id)"
//         ></app-single-task>
//         }

//         <button class="paint" (click)="toggleColorChange()">
//           <img src="brush.png" alt="paint brush" />
//         </button>

//         @if (isColorChanging()) {
//         <div class="color-change">
//           <div class="colors">
//             <div
//               class="single-color red"
//               (click)="changeColor('rgb(148, 17, 7)')"
//             ></div>
//             <div
//               class="single-color orange"
//               (click)="changeColor('rgb(201, 129, 6)')"
//             ></div>
//             <div
//               class="single-color yellow"
//               (click)="changeColor('rgb(195, 189, 17)')"
//             ></div>
//             <div
//               class="single-color green"
//               (click)="changeColor('rgb(4, 174, 103)')"
//             ></div>
//             <div
//               class="single-color purple"
//               (click)="changeColor('rgb(49, 5, 72)')"
//             ></div>
//             <div
//               class="single-color blue"
//               (click)="changeColor('rgb(19, 17, 60)')"
//             ></div>
//             <div class="single-color teal" (click)="changeColor('teal')"></div>
//             <div class="single-color cyan" (click)="changeColor('cyan')"></div>
//             <div
//               class="single-color pink"
//               (click)="changeColor('rgb(226, 159, 170)')"
//             ></div>
//             <div class="single-color black" (click)="changeColor('gray')"></div>
//           </div>
//         </div>
//         }
//       </section>

//       <section
//         class="lists"
//         [style.background-image]="listsBgImage()"
//         (drop)="onDrop($event)"
//         (dragover)="onDragOver($event)"
//       >
//         <div class="header">
//           <h1>My Sections</h1>
//           <button class="add-section" (click)="addSection()">
//             <img src="add-white.png" alt="add" class="add" />
//           </button>
//         </div>
//         <div class="main-div">
//           @for (section of taskService.newSectionArray(); track section.id) {
//           <app-add-section
//             [section]="section"
//             (onColorChange)="section.color = $event"
//             (onDeleteSection)="taskService.deleteSection(section.id)"
//             (onDrop)="taskService.onDrop($event, section.id)"
//             (onDragOver)="taskService.onDragOver($event)"
//           ></app-add-section>
//           }
//         </div>
//       </section>
//     </main>
//     @if (taskService.undoMessage().show) {
//     <app-undo
//       [show]="taskService.undoMessage().show"
//       (onUndo)="onUndo()"
//     ></app-undo>
//     }
//   `,
//   styleUrl: './app.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class App {
//   isColorChanging = signal(false);
//   sec1Color = signal('rgb(19, 17, 60)');
//   secTodayColor = signal('rgb(19, 17, 60)');
//   listsBgImage = signal<string>(
//     'linear-gradient(to bottom, rgb(77, 17, 27), rgb(208, 79, 101))'
//   );

//   constructor(public taskService: TaskService) {}

//   addTask(title: string) {
//     this.taskService.addTask(title);
//   }

//   toggleMarked(task: Task) {
//     task.isMarked = !task.isMarked;
//   }

//   onDeleteTask(task: Task) {
//     this.taskService.deleteTask(task.id);
//   }

//   updateTaskTitle(task: Task, newTitle: string) {
//     task.title = newTitle;
//   }

//   addSection() {
//     this.taskService.addSection('New Section');
//   }

//   toggleColorChange() {
//     this.isColorChanging.update((value) => !value);
//   }

//   changeColor(color: string) {
//     this.sec1Color.set(color);
//     this.isColorChanging.set(false);
//   }

//   onUndo() {
//     const message = this.taskService.undoMessage();
//     if (message.task) {
//       this.taskService.undoDelete(message.task, message.sectionId);
//     }
//   }

//   onDragStart(event: DragEvent, taskId: string) {
//     this.taskService.onDragStart(event, taskId, '');
//   }

//   onDrop(event: DragEvent) {
//     this.taskService.onDrop(event);
//   }

//   onDragOver(event: DragEvent) {
//     this.taskService.onDragOver(event);
//   }
// }

import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
  task: string;
  marked: boolean;
  hover: boolean;
  saved: boolean;
}

interface Section {
  title: string;
  exist: boolean;
  clickOnTitle: boolean;
  tasks: Task[];
  newTask: string; // Add this for input binding
  collapsed?: boolean;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgStyle, NgClass, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // გასაკეთებელი დავალებები:
  // 1). სექციის ზომის გასწორება, რომ არ იყოს მთლიან სიმაღლეზე
  // 2). სექციას დავამატო ფუნცქია რომ იხურებოდეს, ანუ პატარავდებოდეს ზომაში
  // 3). შემეძლოს სექციის ფერის შეცვლა

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  tasks: Task[] = [];
  todayTasks: Task[] = [];
  newTask: string = '';
  loader = signal<boolean>(false);
  todayTitle: string = 'Today';
  todayExist: boolean = true;
  todayClickOnTitle: boolean = false;
  todayCollapsed = signal<boolean>(false);
  sec1Color: string = 'rgb(19, 17, 60)'; // Default color for sec-1
  sec2Color: string =
    'linear-gradient(to bottom, rgb(77, 17, 27), rgb(208, 79, 101))';
  secTodayColor: string = 'rgb(19, 17, 60)';

  ngOnInit() {
    const saved = localStorage.getItem('tasks');
    const savedToday = localStorage.getItem('todayTasks');
    const savedSections = localStorage.getItem('sections');
    const savedTodayTitle = localStorage.getItem('todayTitle');
    const savedTodayExist = localStorage.getItem('todayExist');
    const savedSec1Color = localStorage.getItem('sec1Color');
    const savedSec2Color = localStorage.getItem('sec2Color');
    const savedSecTodayColor = localStorage.getItem('secTodayColor');

    if (saved) {
      this.tasks = JSON.parse(saved);
    }

    if (savedToday) {
      this.todayTasks = JSON.parse(savedToday);
    }

    if (savedSections) {
      this.newSectionArray.set(JSON.parse(savedSections));
    }

    if (savedTodayTitle) {
      this.todayTitle = JSON.parse(savedTodayTitle);
    }

    if (savedTodayExist) {
      this.todayExist = JSON.parse(savedTodayExist);
    }

    if (savedSec1Color) {
      this.sec1Color = JSON.parse(savedSec1Color);
    }

    if (savedSec2Color) {
      this.sec2Color = JSON.parse(savedSec2Color);
    }

    if (savedSecTodayColor) {
      this.secTodayColor = JSON.parse(savedSecTodayColor);
    }

    if (savedSections) {
      const sections = JSON.parse(savedSections);
      this.newSectionArray.set(sections);
      this.showSectionColors = sections.map(() => false);
    }
  }

  private saveTasksInStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('todayTasks', JSON.stringify(this.todayTasks));
    localStorage.setItem('sections', JSON.stringify(this.newSectionArray()));
    localStorage.setItem('todayTitle', JSON.stringify(this.todayTitle));
    localStorage.setItem('todayExist', JSON.stringify(this.todayExist));
    localStorage.setItem('sec1Color', JSON.stringify(this.sec1Color));
    localStorage.setItem('sec2Color', JSON.stringify(this.sec2Color));
    localStorage.setItem('secTodayColor', JSON.stringify(this.secTodayColor));
  }

  addTask(): void {
    if (this.newTask.trim()) {
      this.tasks.push({
        task: this.newTask.trim(),
        marked: false,
        hover: false,
        saved: false,
      });
      this.newTask = '';
      this.saveTasksInStorage();
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////
  draggedTaskIndex: number | null = null;
  draggedFrom: string | null = null;

  // onDragStart(index: number, from: 'tasks' | 'todayTasks') {
  //   this.draggedTaskIndex = index;
  //   this.draggedFrom = from;
  // }

  onDragStart(index: number, from: string) {
    this.draggedTaskIndex = index;
    this.draggedFrom = from;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();

    // Add visual feedback for drop zones
    if (this.draggedFrom) {
      const target = event.currentTarget as HTMLElement;
      target.classList.add('drag-over');

      // Remove the class after a short delay
      setTimeout(() => {
        target.classList.remove('drag-over');
      }, 100);
    }
  }

  // Calculate drop index for reordering within the same list
  getDropIndex(
    event: DragEvent,
    listName: 'tasks' | 'todayTasks' | 'section',
    sectionIndex?: number
  ): number | undefined {
    if (!this.draggedFrom) return undefined;

    // Only calculate drop index if dragging within the same list
    if (listName === 'tasks' && this.draggedFrom === 'tasks') {
      return this.calculateDropIndex(event, this.tasks);
    } else if (listName === 'todayTasks' && this.draggedFrom === 'todayTasks') {
      return this.calculateDropIndex(event, this.todayTasks);
    } else if (
      listName === 'section' &&
      sectionIndex !== undefined &&
      this.draggedFrom === `section-${sectionIndex}`
    ) {
      const sections = this.newSectionArray();
      return this.calculateDropIndex(event, sections[sectionIndex].tasks);
    }

    return undefined;
  }

  // Helper function to calculate drop index based on mouse position
  private calculateDropIndex(event: DragEvent, taskList: Task[]): number {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;

    // Find the task element at the drop position
    const taskElements = target.querySelectorAll('.task-div');
    let dropIndex = taskList.length; // Default to end of list

    for (let i = 0; i < taskElements.length; i++) {
      const taskElement = taskElements[i] as HTMLElement;
      const taskRect = taskElement.getBoundingClientRect();
      const taskTop = taskRect.top - rect.top;
      const taskBottom = taskRect.bottom - rect.top;

      if (y >= taskTop && y <= taskBottom) {
        // If dropping in the upper half of a task, insert before it
        if (y < (taskTop + taskBottom) / 2) {
          dropIndex = i;
        } else {
          dropIndex = i + 1;
        }
        break;
      }
    }

    return dropIndex;
  }

  // Enhanced drop function that can handle dropping to specific sections
  dropTaskToSection(targetSectionIndex: number, dropIndex?: number) {
    if (this.draggedFrom && this.draggedTaskIndex !== null) {
      let taskToMove: Task | undefined;

      // Get task from source
      if (this.draggedFrom === 'tasks') {
        taskToMove = this.tasks[this.draggedTaskIndex];
        this.tasks.splice(this.draggedTaskIndex, 1);
      } else if (this.draggedFrom === 'todayTasks') {
        taskToMove = this.todayTasks[this.draggedTaskIndex];
        this.todayTasks.splice(this.draggedTaskIndex, 1);
      } else if (this.draggedFrom.startsWith('section-')) {
        const sourceSectionIndex = parseInt(this.draggedFrom.split('-')[1], 10);
        const sections = this.newSectionArray();
        if (sections[sourceSectionIndex]) {
          taskToMove =
            sections[sourceSectionIndex].tasks[this.draggedTaskIndex];
          sections[sourceSectionIndex].tasks.splice(this.draggedTaskIndex, 1);
          this.newSectionArray.set([...sections]);
        }
      }

      // Add task to target section
      if (taskToMove) {
        const sections = this.newSectionArray();
        if (sections[targetSectionIndex]) {
          if (
            dropIndex !== undefined &&
            this.draggedFrom === `section-${targetSectionIndex}`
          ) {
            // Reordering within the same section
            sections[targetSectionIndex].tasks.splice(dropIndex, 0, taskToMove);
          } else {
            // Moving from different source
            sections[targetSectionIndex].tasks.push(taskToMove);
          }
          this.newSectionArray.set([...sections]);
        }
      }
    }

    this.draggedTaskIndex = null;
    this.draggedFrom = null;
    this.saveTasksInStorage();
  }

  // Enhanced drop function for main lists
  dropTaskToMainList(
    targetListName: 'tasks' | 'todayTasks',
    dropIndex?: number
  ) {
    if (this.draggedFrom && this.draggedTaskIndex !== null) {
      let taskToMove: Task | undefined;

      // Get task from source
      if (this.draggedFrom === 'tasks') {
        taskToMove = this.tasks[this.draggedTaskIndex];
        this.tasks.splice(this.draggedTaskIndex, 1);
      } else if (this.draggedFrom === 'todayTasks') {
        taskToMove = this.todayTasks[this.draggedTaskIndex];
        this.todayTasks.splice(this.draggedTaskIndex, 1);
      } else if (this.draggedFrom.startsWith('section-')) {
        const sourceSectionIndex = parseInt(this.draggedFrom.split('-')[1], 10);
        const sections = this.newSectionArray();
        if (sections[sourceSectionIndex]) {
          taskToMove =
            sections[sourceSectionIndex].tasks[this.draggedTaskIndex];
          sections[sourceSectionIndex].tasks.splice(this.draggedTaskIndex, 1);
          this.newSectionArray.set([...sections]);
        }
      }

      // Add task to target main list
      if (taskToMove) {
        if (targetListName === 'tasks') {
          if (dropIndex !== undefined && this.draggedFrom === 'tasks') {
            // Reordering within the same list
            this.tasks.splice(dropIndex, 0, taskToMove);
          } else {
            // Moving from different source
            this.tasks.push(taskToMove);
          }
        } else if (targetListName === 'todayTasks') {
          if (dropIndex !== undefined && this.draggedFrom === 'todayTasks') {
            // Reordering within the same list
            this.todayTasks.splice(dropIndex, 0, taskToMove);
          } else {
            // Moving from different source
            this.todayTasks.push(taskToMove);
          }
        }
      }
    }

    this.draggedTaskIndex = null;
    this.draggedFrom = null;
    this.saveTasksInStorage();
  }

  // New function to handle reordering within the same list
  reorderTaskInList(
    listName: 'tasks' | 'todayTasks' | 'section',
    sourceIndex: number,
    targetIndex: number,
    sectionIndex?: number
  ) {
    let sourceList: Task[];
    let targetList: Task[];

    // Get the source and target lists
    if (listName === 'tasks') {
      sourceList = this.tasks;
      targetList = this.tasks;
    } else if (listName === 'todayTasks') {
      sourceList = this.todayTasks;
      targetList = this.todayTasks;
    } else if (listName === 'section' && sectionIndex !== undefined) {
      const sections = this.newSectionArray();
      sourceList = sections[sectionIndex].tasks;
      targetList = sections[sectionIndex].tasks;
    } else {
      return;
    }

    // Remove task from source position
    const [taskToMove] = sourceList.splice(sourceIndex, 1);

    // Insert task at target position
    targetList.splice(targetIndex, 0, taskToMove);

    // Update signals if needed
    if (listName === 'section' && sectionIndex !== undefined) {
      const sections = this.newSectionArray();
      this.newSectionArray.set([...sections]);
    }

    this.saveTasksInStorage();
  }

  ////////////////////////////////////////////////////////////////////////////
  visibleDelete = signal<boolean>(false);

  makeDeleteVisible(id: number) {
    this.tasks[id].marked = !this.tasks[id].marked;
  }

  makeDeleteVisibleToday(id: number) {
    this.todayTasks[id].marked = !this.todayTasks[id].marked;
  }

  /////////////////////////////////////////////////////////////////////////////////
  lastDeleted: {
    task: Task;
    index: number;
    fromToday: boolean;
    fromSection?: number;
  } | null = null;
  undoTimeout: any;
  showUndoMessage = signal<boolean>(false);

  deleteTask(id: number) {
    this.lastDeleted = { task: this.tasks[id], index: id, fromToday: false };
    this.tasks.splice(id, 1);
    this.showUndoMessage.set(true);

    clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.finalDelete();
    }, 5000);

    this.saveTasksInStorage();
  }

  deleteTaskToday(id: number) {
    this.lastDeleted = {
      task: this.todayTasks[id],
      index: id,
      fromToday: true,
    };
    this.todayTasks.splice(id, 1);
    this.showUndoMessage.set(true);

    clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.finalDelete();
    }, 5000);

    this.saveTasksInStorage();
  }

  undoDelete() {
    if (!this.lastDeleted) return;

    if (this.lastDeleted.fromToday) {
      if (this.lastDeleted.fromSection !== undefined) {
        // Restore to section
        const sections = this.newSectionArray();
        sections[this.lastDeleted.fromSection].tasks.splice(
          this.lastDeleted.index,
          0,
          this.lastDeleted.task
        );
        this.newSectionArray.set([...sections]);
      } else {
        // Restore to todayTasks
        this.todayTasks.splice(
          this.lastDeleted.index,
          0,
          this.lastDeleted.task
        );
      }
    } else {
      this.tasks.splice(this.lastDeleted.index, 0, this.lastDeleted.task);
    }

    this.lastDeleted = null;
    this.showUndoMessage.set(false);
    clearTimeout(this.undoTimeout);
    this.saveTasksInStorage();
  }

  finalDelete() {
    this.lastDeleted = null;
    this.showUndoMessage.set(false);
    this.saveTasksInStorage();
  }

  closeUndo() {
    this.showUndoMessage.set(false);
  }

  ///////////////////////////////////////////////////////////////////////////////////
  originalTaskText: string = '';

  editTask(id: number) {
    this.originalTaskText = this.tasks[id].task;
    this.tasks[id].saved = true;
    this.tasks[id].marked = false;
    this.saveTasksInStorage();
  }

  saveTask(id: number) {
    if (!this.tasks[id].task.trim()) {
      this.tasks[id].task = this.originalTaskText;
    }
    this.tasks[id].saved = false;
    this.originalTaskText = '';
    this.saveTasksInStorage();
  }

  editTaskToday(id: number) {
    this.originalTaskText = this.todayTasks[id].task;
    this.todayTasks[id].saved = true;
    this.todayTasks[id].marked = false;
    this.saveTasksInStorage();
  }

  saveTaskToday(id: number) {
    if (!this.todayTasks[id].task.trim()) {
      this.todayTasks[id].task = this.originalTaskText;
    }
    this.todayTasks[id].saved = false;
    this.originalTaskText = '';
    this.saveTasksInStorage();
  }

  // Today section title edit/delete controls
  changeTodayTitle() {
    this.todayClickOnTitle = true;
    this.saveTasksInStorage();
  }

  saveTodayTitle() {
    const typedTitle = this.todayTitle.trim();
    this.todayTitle = typedTitle || 'Today';
    this.todayClickOnTitle = false;
    this.saveTasksInStorage();
  }

  deleteTodaySection() {
    this.todayExist = false;
    this.saveTasksInStorage();
  }

  // Collapse controls
  toggleTodayCollapsed() {
    this.todayCollapsed.set(!this.todayCollapsed());
  }

  toggleSectionCollapsed(sectionIndex: number) {
    const sections = this.newSectionArray();
    if (!sections[sectionIndex]) return;
    sections[sectionIndex].collapsed = !sections[sectionIndex].collapsed;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  /////////////////////////////////////////////////////////////////////////////////
  newSectionArray = signal<Section[]>([]);
  sectionTitle = signal<string>('New Section');
  newSection = signal<boolean>(false);

  addSection() {
    if (!this.sectionTitle().trim()) return;

    this.newSection.set(true);

    this.loader.set(true);

    setTimeout(() => {
      const sections = this.newSectionArray();
      sections.push({
        title: this.sectionTitle().trim(),
        exist: true,
        clickOnTitle: false,
        tasks: [],
        newTask: '', // Initialize newTask
        collapsed: false,
        color: 'rgb(19, 17, 60)',
      });
      this.newSectionArray.set([...sections]);
      this.showSectionColors[sections.length - 1] = false;
      this.newSection.set(false);
      this.loader.set(false);
    }, 3000);

    this.saveTasksInStorage();
  }

  deleteSection(id: number) {
    const sections = this.newSectionArray();
    sections.splice(id, 1);
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  changeTitle(id: number) {
    const sections = this.newSectionArray();
    this.originalTaskText = sections[id].title;

    sections[id].clickOnTitle = true;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  saveSectionTitle(id: number) {
    const sections = this.newSectionArray();
    const typedTitle = sections[id].title.trim();

    sections[id].title = typedTitle || 'New Section'; // fallback to default
    sections[id].clickOnTitle = false; // exit edit mode
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // Fixed section task management
  makeDeleteVisibleAddedSection(sectionIndex: number, taskIndex: number) {
    const sections = this.newSectionArray();
    sections[sectionIndex].tasks[taskIndex].marked =
      !sections[sectionIndex].tasks[taskIndex].marked;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  deleteTaskFromSection(sectionIndex: number, taskIndex: number) {
    const sections = this.newSectionArray();
    this.lastDeleted = {
      task: sections[sectionIndex].tasks[taskIndex],
      index: taskIndex,
      fromToday: true,
      fromSection: sectionIndex,
    };
    sections[sectionIndex].tasks.splice(taskIndex, 1);
    this.newSectionArray.set([...sections]);
    this.showUndoMessage.set(true);

    clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.finalDelete();
    }, 5000);

    this.saveTasksInStorage();
  }

  editTaskFromSection(sectionIndex: number, taskIndex: number) {
    const sections = this.newSectionArray();
    this.originalTaskText = sections[sectionIndex].tasks[taskIndex].task;
    sections[sectionIndex].tasks[taskIndex].saved = true;
    sections[sectionIndex].tasks[taskIndex].marked = false;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  saveTaskFromSection(sectionIndex: number, taskIndex: number) {
    const sections = this.newSectionArray();
    if (!sections[sectionIndex].tasks[taskIndex].task.trim()) {
      sections[sectionIndex].tasks[taskIndex].task = this.originalTaskText;
    }
    sections[sectionIndex].tasks[taskIndex].saved = false;
    this.originalTaskText = '';
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  // Handle drag start for section tasks
  onDragStartFromSection(taskIndex: number, sectionIndex: number) {
    this.draggedTaskIndex = taskIndex;
    this.draggedFrom = `section-${sectionIndex}`;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  changeColors = signal<boolean>(false);

  showColors() {
    this.changeColors.set(!this.changeColors());
  }

  changeSec1Color(color: string) {
    this.sec1Color = color;
    this.changeColors.set(false);
    this.saveTasksInStorage();
  }

  changeListsColor = signal<boolean>(false);

  showColorsLista() {
    this.changeListsColor.set(!this.changeListsColor());
  }

  changeSec2Color(color: string) {
    this.sec2Color = color;
    this.changeListsColor.set(false);
    this.saveTasksInStorage();
  }

  changeTodayColor = signal<boolean>(false);

  showColorsToday() {
    this.changeTodayColor.set(!this.changeTodayColor());
  }

  changeSecTodayColor(color: string) {
    this.secTodayColor = color;
    this.changeTodayColor.set(false);
    this.saveTasksInStorage();
  }

  /////////////////////////////////////////////////////////////////////////////
  showSectionColors: boolean[] = [];

  // Method to show color picker for a specific section
  showSectionColorPicker(index: number) {
    this.showSectionColors[index] = !this.showSectionColors[index];
  }

  // Method to change the color of a specific section
  changeSectionColor(index: number, color: string) {
    const sections = this.newSectionArray();
    if (sections[index]) {
      sections[index].color = color;
      this.newSectionArray.set([...sections]);
      this.showSectionColors[index] = false;
      this.saveTasksInStorage();
    }
  }
}
