import { Injectable, signal, Signal } from '@angular/core';

/**
 * Shared service containing all interfaces, signals, localStorage logic, and functions.
 * This is a single source of truth for the whole app.
 */

/* Interfaces */
export interface Task {
  task: string;
  marked: boolean;
  hover: boolean;
  saved: boolean;
}

export interface Section {
  title: string;
  exist: boolean;
  clickOnTitle: boolean;
  tasks: Task[];
  newTask: string;
  collapsed?: boolean;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Data signals
  tasks = signal<Task[]>([]);
  todayTasks = signal<Task[]>([]);
  newSectionArray = signal<Section[]>([]);
  // UI / misc signals
  loader = signal<boolean>(false);
  todayCollapsed = signal<boolean>(false);
  visibleDelete = signal<boolean>(false);
  showUndoMessage = signal<boolean>(false);
  changeColors = signal<boolean>(false);
  changeListsColor = signal<boolean>(false);
  changeTodayColor = signal<boolean>(false);

  // simple fields (non-signal) that are convenient to bind
  newTask = '';
  todayTitle = 'Today';
  todayExist = true;
  todayClickOnTitle = false;

  sec1Color = 'rgb(19, 17, 60)';
  sec2Color = 'linear-gradient(to bottom, rgb(77, 17, 27), rgb(208, 79, 101))';
  secTodayColor = 'rgb(19, 17, 60)';

  showSectionColors: boolean[] = [];

  // Drag state
  draggedTaskIndex: number | null = null;
  draggedFrom: string | null = null;

  // Undo
  lastDeleted: {
    task: Task;
    index: number;
    fromToday: boolean;
    fromSection?: number;
  } | null = null;
  undoTimeout: any;

  // helper for edit original text
  originalTaskText = '';

  constructor() {
    this.ngOnInit();
  }

  // ---------- Persistence ----------
  private saveTasksInStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    localStorage.setItem('todayTasks', JSON.stringify(this.todayTasks()));
    localStorage.setItem('sections', JSON.stringify(this.newSectionArray()));
    localStorage.setItem('todayTitle', JSON.stringify(this.todayTitle));
    localStorage.setItem('todayExist', JSON.stringify(this.todayExist));
    localStorage.setItem('sec1Color', JSON.stringify(this.sec1Color));
    localStorage.setItem('sec2Color', JSON.stringify(this.sec2Color));
    localStorage.setItem('secTodayColor', JSON.stringify(this.secTodayColor));
  }

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
      this.tasks.set(JSON.parse(saved));
    }
    if (savedToday) {
      this.todayTasks.set(JSON.parse(savedToday));
    }
    if (savedSections) {
      this.newSectionArray.set(JSON.parse(savedSections));
      const sections = JSON.parse(savedSections);
      this.showSectionColors = sections.map(() => false);
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
  }

  // ---------- Basic Task Actions ----------
  addTask() {
    if (this.newTask.trim()) {
      const task: Task = {
        task: this.newTask.trim(),
        marked: false,
        hover: false,
        saved: false,
      };
      this.tasks.set([...this.tasks(), task]);
      this.newTask = '';
      this.saveTasksInStorage();
    }
  }

  makeDeleteVisible(id: number) {
    const arr = [...this.tasks()];
    arr[id].marked = !arr[id].marked;
    this.tasks.set(arr);
  }

  makeDeleteVisibleToday(id: number) {
    const arr = [...this.todayTasks()];
    arr[id].marked = !arr[id].marked;
    this.todayTasks.set(arr);
  }

  // ---------- Delete / Undo ----------
  deleteTask(id: number) {
    this.lastDeleted = {
      task: this.tasks()[id],
      index: id,
      fromToday: false,
    };
    const arr = [...this.tasks()];
    arr.splice(id, 1);
    this.tasks.set(arr);
    this.showUndoMessage.set(true);
    clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.finalDelete();
    }, 5000);
    this.saveTasksInStorage();
  }

  deleteTaskToday(id: number) {
    this.lastDeleted = {
      task: this.todayTasks()[id],
      index: id,
      fromToday: true,
    };
    const arr = [...this.todayTasks()];
    arr.splice(id, 1);
    this.todayTasks.set(arr);
    this.showUndoMessage.set(true);
    clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      this.finalDelete();
    }, 5000);
    this.saveTasksInStorage();
  }

  deleteTaskFromSection(sectionIndex: number, taskIndex: number) {
    const sections = [...this.newSectionArray()];
    this.lastDeleted = {
      task: sections[sectionIndex].tasks[taskIndex],
      index: taskIndex,
      fromToday: true,
      fromSection: sectionIndex,
    };
    sections[sectionIndex].tasks.splice(taskIndex, 1);
    this.newSectionArray.set(sections);
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
        const sections = [...this.newSectionArray()];
        sections[this.lastDeleted.fromSection].tasks.splice(
          this.lastDeleted.index,
          0,
          this.lastDeleted.task
        );
        this.newSectionArray.set([...sections]);
      } else {
        const arr = [...this.todayTasks()];
        arr.splice(this.lastDeleted.index, 0, this.lastDeleted.task);
        this.todayTasks.set(arr);
      }
    } else {
      const arr = [...this.tasks()];
      arr.splice(this.lastDeleted.index, 0, this.lastDeleted.task);
      this.tasks.set(arr);
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

  // ---------- Edit / Save ----------
  editTask(id: number) {
    this.originalTaskText = this.tasks()[id].task;
    const arr = [...this.tasks()];
    arr[id].saved = true;
    arr[id].marked = false;
    this.tasks.set(arr);
    this.saveTasksInStorage();
  }

  saveTask(id: number) {
    const arr = [...this.tasks()];
    if (!arr[id].task.trim()) {
      arr[id].task = this.originalTaskText;
    }
    arr[id].saved = false;
    this.originalTaskText = '';
    this.tasks.set(arr);
    this.saveTasksInStorage();
  }

  editTaskToday(id: number) {
    this.originalTaskText = this.todayTasks()[id].task;
    const arr = [...this.todayTasks()];
    arr[id].saved = true;
    arr[id].marked = false;
    this.todayTasks.set(arr);
    this.saveTasksInStorage();
  }

  saveTaskToday(id: number) {
    const arr = [...this.todayTasks()];
    if (!arr[id].task.trim()) {
      arr[id].task = this.originalTaskText;
    }
    arr[id].saved = false;
    this.originalTaskText = '';
    this.todayTasks.set(arr);
    this.saveTasksInStorage();
  }

  editTaskFromSection(sectionIndex: number, taskIndex: number) {
    const sections = [...this.newSectionArray()];
    this.originalTaskText = sections[sectionIndex].tasks[taskIndex].task;
    sections[sectionIndex].tasks[taskIndex].saved = true;
    sections[sectionIndex].tasks[taskIndex].marked = false;
    this.newSectionArray.set(sections);
    this.saveTasksInStorage();
  }

  saveTaskFromSection(sectionIndex: number, taskIndex: number) {
    const sections = [...this.newSectionArray()];
    if (!sections[sectionIndex].tasks[taskIndex].task.trim()) {
      sections[sectionIndex].tasks[taskIndex].task = this.originalTaskText;
    }
    sections[sectionIndex].tasks[taskIndex].saved = false;
    this.originalTaskText = '';
    this.newSectionArray.set(sections);
    this.saveTasksInStorage();
  }

  // ---------- Today Title / Delete ----------
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

  // ---------- Collapsing ----------
  toggleTodayCollapsed() {
    this.todayCollapsed.set(!this.todayCollapsed());
  }

  toggleSectionCollapsed(sectionIndex: number) {
    const sections = [...this.newSectionArray()];
    if (!sections[sectionIndex]) return;
    sections[sectionIndex].collapsed = !sections[sectionIndex].collapsed;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  // ---------- Sections ----------
  sectionTitle = signal<string>('New Section');
  newSection = signal<boolean>(false);

  addSection() {
    if (!this.sectionTitle().trim()) return;
    this.newSection.set(true);
    this.loader.set(true);
    setTimeout(() => {
      const sections = [...this.newSectionArray()];
      sections.push({
        title: this.sectionTitle().trim(),
        exist: true,
        clickOnTitle: false,
        tasks: [],
        newTask: '',
        collapsed: false,
        color: 'rgb(19, 17, 60)',
      });
      this.newSectionArray.set(sections);
      this.showSectionColors[sections.length - 1] = false;
      this.newSection.set(false);
      this.loader.set(false);
      this.saveTasksInStorage();
    }, 3000);
  }

  deleteSection(id: number) {
    const sections = [...this.newSectionArray()];
    sections.splice(id, 1);
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  changeTitle(id: number) {
    const sections = [...this.newSectionArray()];
    this.originalTaskText = sections[id].title;
    sections[id].clickOnTitle = true;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  saveSectionTitle(id: number) {
    const sections = [...this.newSectionArray()];
    const typedTitle = sections[id].title.trim();
    sections[id].title = typedTitle || 'New Section';
    sections[id].clickOnTitle = false;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  // Add task to section by index
  addTaskToSection(idx: number) {
    const sections = [...this.newSectionArray()];
    if (!sections[idx].newTask?.trim()) return;
    const t: Task = {
      task: sections[idx].newTask.trim(),
      marked: false,
      hover: false,
      saved: false,
    };
    sections[idx].tasks.push(t);
    sections[idx].newTask = '';
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  // Mark toggle for section tasks
  makeDeleteVisibleAddedSection(sectionIndex: number, taskIndex: number) {
    const sections = [...this.newSectionArray()];
    sections[sectionIndex].tasks[taskIndex].marked =
      !sections[sectionIndex].tasks[taskIndex].marked;
    this.newSectionArray.set([...sections]);
    this.saveTasksInStorage();
  }

  // ---------- Drag & Drop (core) ----------
  onDragStart(index: number, from: string) {
    this.draggedTaskIndex = index;
    this.draggedFrom = from;
  }

  onDragStartFromSection(taskIndex: number, sectionIndex: number) {
    this.draggedTaskIndex = taskIndex;
    this.draggedFrom = `section-${sectionIndex}`;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (this.draggedFrom) {
      const target = event.currentTarget as HTMLElement;
      target.classList.add('drag-over');
      setTimeout(() => {
        target.classList.remove('drag-over');
      }, 100);
    }
  }

  private calculateDropIndex(event: DragEvent, taskList: Task[]): number {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const taskElements = target.querySelectorAll('.task-div');
    let dropIndex = taskList.length;
    for (let i = 0; i < taskElements.length; i++) {
      const taskElement = taskElements[i] as HTMLElement;
      const taskRect = taskElement.getBoundingClientRect();
      const taskTop = taskRect.top - rect.top;
      const taskBottom = taskRect.bottom - rect.top;
      if (y >= taskTop && y <= taskBottom) {
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

  getDropIndex(
    event: DragEvent,
    listName: 'tasks' | 'todayTasks' | 'section',
    sectionIndex?: number
  ): number | undefined {
    if (!this.draggedFrom) return undefined;
    if (listName === 'tasks' && this.draggedFrom === 'tasks') {
      return this.calculateDropIndex(event, this.tasks());
    } else if (listName === 'todayTasks' && this.draggedFrom === 'todayTasks') {
      return this.calculateDropIndex(event, this.todayTasks());
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

  dropTaskToSection(targetSectionIndex: number, dropIndex?: number) {
    if (this.draggedFrom && this.draggedTaskIndex !== null) {
      let taskToMove: Task | undefined;
      if (this.draggedFrom === 'tasks') {
        taskToMove = this.tasks()[this.draggedTaskIndex];
        const arr = [...this.tasks()];
        arr.splice(this.draggedTaskIndex, 1);
        this.tasks.set(arr);
      } else if (this.draggedFrom === 'todayTasks') {
        taskToMove = this.todayTasks()[this.draggedTaskIndex];
        const arr = [...this.todayTasks()];
        arr.splice(this.draggedTaskIndex, 1);
        this.todayTasks.set(arr);
      } else if (this.draggedFrom.startsWith('section-')) {
        const sourceSectionIndex = parseInt(this.draggedFrom.split('-')[1], 10);
        const sections = [...this.newSectionArray()];
        if (sections[sourceSectionIndex]) {
          taskToMove =
            sections[sourceSectionIndex].tasks[this.draggedTaskIndex];
          sections[sourceSectionIndex].tasks.splice(this.draggedTaskIndex, 1);
          this.newSectionArray.set([...sections]);
        }
      }

      if (taskToMove) {
        const sections = [...this.newSectionArray()];
        if (sections[targetSectionIndex]) {
          if (
            dropIndex !== undefined &&
            this.draggedFrom === `section-${targetSectionIndex}`
          ) {
            sections[targetSectionIndex].tasks.splice(dropIndex, 0, taskToMove);
          } else {
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

  dropTaskToMainList(
    targetListName: 'tasks' | 'todayTasks',
    dropIndex?: number
  ) {
    if (this.draggedFrom && this.draggedTaskIndex !== null) {
      let taskToMove: Task | undefined;
      if (this.draggedFrom === 'tasks') {
        taskToMove = this.tasks()[this.draggedTaskIndex];
        const arr = [...this.tasks()];
        arr.splice(this.draggedTaskIndex, 1);
        this.tasks.set(arr);
      } else if (this.draggedFrom === 'todayTasks') {
        taskToMove = this.todayTasks()[this.draggedTaskIndex];
        const arr = [...this.todayTasks()];
        arr.splice(this.draggedTaskIndex, 1);
        this.todayTasks.set(arr);
      } else if (this.draggedFrom.startsWith('section-')) {
        const sourceSectionIndex = parseInt(this.draggedFrom.split('-')[1], 10);
        const sections = [...this.newSectionArray()];
        if (sections[sourceSectionIndex]) {
          taskToMove =
            sections[sourceSectionIndex].tasks[this.draggedTaskIndex];
          sections[sourceSectionIndex].tasks.splice(this.draggedTaskIndex, 1);
          this.newSectionArray.set([...sections]);
        }
      }

      if (taskToMove) {
        if (targetListName === 'tasks') {
          if (dropIndex !== undefined && this.draggedFrom === 'tasks') {
            const arr = [...this.tasks()];
            arr.splice(dropIndex, 0, taskToMove);
            this.tasks.set(arr);
          } else {
            this.tasks.set([...this.tasks(), taskToMove]);
          }
        } else if (targetListName === 'todayTasks') {
          if (dropIndex !== undefined && this.draggedFrom === 'todayTasks') {
            const arr = [...this.todayTasks()];
            arr.splice(dropIndex, 0, taskToMove);
            this.todayTasks.set(arr);
          } else {
            this.todayTasks.set([...this.todayTasks(), taskToMove]);
          }
        }
      }
    }
    this.draggedTaskIndex = null;
    this.draggedFrom = null;
    this.saveTasksInStorage();
  }

  reorderTaskInList(
    listName: 'tasks' | 'todayTasks' | 'section',
    sourceIndex: number,
    targetIndex: number,
    sectionIndex?: number
  ) {
    let sourceList: Task[];
    if (listName === 'tasks') {
      sourceList = [...this.tasks()];
    } else if (listName === 'todayTasks') {
      sourceList = [...this.todayTasks()];
    } else if (listName === 'section' && sectionIndex !== undefined) {
      const sections = [...this.newSectionArray()];
      sourceList = [...sections[sectionIndex].tasks];
    } else {
      return;
    }

    const [taskToMove] = sourceList.splice(sourceIndex, 1);
    sourceList.splice(targetIndex, 0, taskToMove);

    if (listName === 'tasks') {
      this.tasks.set(sourceList);
    } else if (listName === 'todayTasks') {
      this.todayTasks.set(sourceList);
    } else if (listName === 'section' && sectionIndex !== undefined) {
      const sections = [...this.newSectionArray()];
      sections[sectionIndex].tasks = sourceList;
      this.newSectionArray.set([...sections]);
    }
    this.saveTasksInStorage();
  }

  // ---------- Colors ----------
  showColorsToggle() {
    this.changeColors.set(!this.changeColors());
  }
  changeSec1Color(color: string) {
    this.sec1Color = color;
    this.changeColors.set(false);
    this.saveTasksInStorage();
  }

  showColorsListaToggle() {
    this.changeListsColor.set(!this.changeListsColor());
  }
  changeSec2Color(color: string) {
    this.sec2Color = color;
    this.changeListsColor.set(false);
    this.saveTasksInStorage();
  }

  showColorsTodayToggle() {
    this.changeTodayColor.set(!this.changeTodayColor());
  }
  changeSecTodayColor(color: string) {
    this.secTodayColor = color;
    this.changeTodayColor.set(false);
    this.saveTasksInStorage();
  }

  // Section color picker handling
  showSectionColorPicker(index: number) {
    this.showSectionColors[index] = !this.showSectionColors[index];
  }

  changeSectionColor(index: number, color: string) {
    const sections = [...this.newSectionArray()];
    if (sections[index]) {
      sections[index].color = color;
      this.newSectionArray.set([...sections]);
      this.showSectionColors[index] = false;
      this.saveTasksInStorage();
    }
  }
}

// // src/app/core/task.service.ts
// import { Injectable, signal } from '@angular/core';
// // import { Section, Task } from './interfaces';

// export interface Task {
//   task: string;
//   marked: boolean;
//   hover: boolean;
//   saved: boolean;
// }

// export interface Section {
//   title: string;
//   exist: boolean;
//   clickOnTitle: boolean;
//   tasks: Task[];
//   newTask: string;
//   collapsed?: boolean;
//   color: string;
// }

// @Injectable({ providedIn: 'root' })
// export class TaskService {
//   // ======= STATE (moved from App) =======
//   tasks = signal<Task[]>([]);
//   todayTasks = signal<Task[]>([]);
//   loader = signal<boolean>(false);

//   todayTitle = signal<string>('Today');
//   todayExist = signal<boolean>(true);
//   todayClickOnTitle = signal<boolean>(false);
//   todayCollapsed = signal<boolean>(false);

//   // Colors
//   sec1Color = signal<string>('rgb(19, 17, 60)');
//   sec2Color = signal<string>(
//     'linear-gradient(to bottom, rgb(77, 17, 27), rgb(208, 79, 101))'
//   );
//   secTodayColor = signal<string>('rgb(19, 17, 60)');

//   // Sections
//   newSectionArray = signal<Section[]>([]);
//   sectionTitle = signal<string>('New Section');
//   newSection = signal<boolean>(false);

//   // Drag state
//   draggedTaskIndex: number | null = null;
//   draggedFrom: string | null = null;

//   // Undo
//   lastDeleted: {
//     task: Task;
//     index: number;
//     fromToday: boolean;
//     fromSection?: number;
//   } | null = null;
//   undoTimeout: any;
//   showUndoMessage = signal<boolean>(false);

//   // Color pickers
//   changeColors = signal<boolean>(false);
//   changeListsColor = signal<boolean>(false);
//   changeTodayColor = signal<boolean>(false);
//   showSectionColors = signal<boolean[]>([]);

//   constructor() {
//     this.loadFromStorage();
//   }

//   // ======= PERSISTENCE =======
//   private loadFromStorage() {
//     try {
//       const saved = localStorage.getItem('tasks');
//       const savedToday = localStorage.getItem('todayTasks');
//       const savedSections = localStorage.getItem('sections');
//       const savedTodayTitle = localStorage.getItem('todayTitle');
//       const savedTodayExist = localStorage.getItem('todayExist');
//       const savedSec1Color = localStorage.getItem('sec1Color');
//       const savedSec2Color = localStorage.getItem('sec2Color');
//       const savedSecTodayColor = localStorage.getItem('secTodayColor');

//       if (saved) this.tasks.set(JSON.parse(saved));
//       if (savedToday) this.todayTasks.set(JSON.parse(savedToday));
//       if (savedSections) {
//         const sections: Section[] = JSON.parse(savedSections);
//         this.newSectionArray.set(sections);
//         this.showSectionColors.set(sections.map(() => false));
//       }
//       if (savedTodayTitle) this.todayTitle.set(JSON.parse(savedTodayTitle));
//       if (savedTodayExist) this.todayExist.set(JSON.parse(savedTodayExist));
//       if (savedSec1Color) this.sec1Color.set(JSON.parse(savedSec1Color));
//       if (savedSec2Color) this.sec2Color.set(JSON.parse(savedSec2Color));
//       if (savedSecTodayColor)
//         this.secTodayColor.set(JSON.parse(savedSecTodayColor));
//     } catch {
//       // ignore parse errors
//     }
//   }

//   private saveTasksInStorage() {
//     localStorage.setItem('tasks', JSON.stringify(this.tasks()));
//     localStorage.setItem('todayTasks', JSON.stringify(this.todayTasks()));
//     localStorage.setItem('sections', JSON.stringify(this.newSectionArray()));
//     localStorage.setItem('todayTitle', JSON.stringify(this.todayTitle()));
//     localStorage.setItem('todayExist', JSON.stringify(this.todayExist()));
//     localStorage.setItem('sec1Color', JSON.stringify(this.sec1Color()));
//     localStorage.setItem('sec2Color', JSON.stringify(this.sec2Color()));
//     localStorage.setItem('secTodayColor', JSON.stringify(this.secTodayColor()));
//   }

//   // ======= SEC-1 (left) =======
//   addTask(text: string): void {
//     const t = text?.trim();
//     if (!t) return;
//     const next = [
//       ...this.tasks(),
//       { task: t, marked: false, hover: false, saved: false },
//     ];
//     this.tasks.set(next);
//     this.saveTasksInStorage();
//   }

//   makeDeleteVisible(id: number) {
//     const list = [...this.tasks()];
//     if (!list[id]) return;
//     list[id] = { ...list[id], marked: !list[id].marked };
//     this.tasks.set(list);
//     this.saveTasksInStorage();
//   }

//   deleteTask(id: number) {
//     const list = [...this.tasks()];
//     if (!list[id]) return;
//     this.lastDeleted = { task: list[id], index: id, fromToday: false };
//     list.splice(id, 1);
//     this.tasks.set(list);
//     this.showUndoMessage.set(true);
//     clearTimeout(this.undoTimeout);
//     this.undoTimeout = setTimeout(() => this.finalDelete(), 5000);
//     this.saveTasksInStorage();
//   }

//   editTask(id: number) {
//     const list = [...this.tasks()];
//     if (!list[id]) return;
//     list[id] = { ...list[id], saved: true, marked: false };
//     this.tasks.set(list);
//     this.saveTasksInStorage();
//   }

//   saveTask(id: number, originalTaskText: string) {
//     const list = [...this.tasks()];
//     if (!list[id]) return;
//     const text = list[id].task.trim() ? list[id].task : originalTaskText;
//     list[id] = { ...list[id], task: text, saved: false };
//     this.tasks.set(list);
//     this.saveTasksInStorage();
//   }

//   // ======= TODAY =======
//   makeDeleteVisibleToday(id: number) {
//     const list = [...this.todayTasks()];
//     if (!list[id]) return;
//     list[id] = { ...list[id], marked: !list[id].marked };
//     this.todayTasks.set(list);
//     this.saveTasksInStorage();
//   }

//   deleteTaskToday(id: number) {
//     const list = [...this.todayTasks()];
//     if (!list[id]) return;
//     this.lastDeleted = { task: list[id], index: id, fromToday: true };
//     list.splice(id, 1);
//     this.todayTasks.set(list);
//     this.showUndoMessage.set(true);
//     clearTimeout(this.undoTimeout);
//     this.undoTimeout = setTimeout(() => this.finalDelete(), 5000);
//     this.saveTasksInStorage();
//   }

//   editTaskToday(id: number) {
//     const list = [...this.todayTasks()];
//     if (!list[id]) return;
//     list[id] = { ...list[id], saved: true, marked: false };
//     this.todayTasks.set(list);
//     this.saveTasksInStorage();
//   }

//   saveTaskToday(id: number, originalTaskText: string) {
//     const list = [...this.todayTasks()];
//     if (!list[id]) return;
//     const text = list[id].task.trim() ? list[id].task : originalTaskText;
//     list[id] = { ...list[id], task: text, saved: false };
//     this.todayTasks.set(list);
//     this.saveTasksInStorage();
//   }

//   changeTodayTitle() {
//     this.todayClickOnTitle.set(true);
//     this.saveTasksInStorage();
//   }

//   saveTodayTitle() {
//     const typedTitle = this.todayTitle().trim();
//     this.todayTitle.set(typedTitle || 'Today');
//     this.todayClickOnTitle.set(false);
//     this.saveTasksInStorage();
//   }

//   deleteTodaySection() {
//     this.todayExist.set(false);
//     this.saveTasksInStorage();
//   }

//   toggleTodayCollapsed() {
//     this.todayCollapsed.set(!this.todayCollapsed());
//   }

//   // ======= SECTIONS =======
//   addSection() {
//     if (!this.sectionTitle().trim()) return;

//     this.newSection.set(true);
//     this.loader.set(true);

//     setTimeout(() => {
//       const sections = [...this.newSectionArray()];
//       sections.push({
//         title: this.sectionTitle().trim(),
//         exist: true,
//         clickOnTitle: false,
//         tasks: [],
//         newTask: '',
//         collapsed: false,
//         color: 'rgb(19, 17, 60)',
//       });
//       this.newSectionArray.set(sections);

//       const pickerFlags = [...this.showSectionColors()];
//       pickerFlags[sections.length - 1] = false;
//       this.showSectionColors.set(pickerFlags);

//       this.newSection.set(false);
//       this.loader.set(false);
//       this.saveTasksInStorage();
//     }, 3000);
//   }

//   deleteSection(id: number) {
//     const sections = [...this.newSectionArray()];
//     sections.splice(id, 1);
//     this.newSectionArray.set(sections);
//     const pickerFlags = [...this.showSectionColors()];
//     pickerFlags.splice(id, 1);
//     this.showSectionColors.set(pickerFlags);
//     this.saveTasksInStorage();
//   }

//   changeTitle(id: number) {
//     const sections = [...this.newSectionArray()];
//     if (!sections[id]) return;
//     sections[id].clickOnTitle = true;
//     this.newSectionArray.set(sections);
//     this.saveTasksInStorage();
//   }

//   saveSectionTitle(id: number) {
//     const sections = [...this.newSectionArray()];
//     if (!sections[id]) return;
//     const typedTitle = sections[id].title.trim();
//     sections[id].title = typedTitle || 'New Section';
//     sections[id].clickOnTitle = false;
//     this.newSectionArray.set(sections);
//     this.saveTasksInStorage();
//   }

//   toggleSectionCollapsed(sectionIndex: number) {
//     const sections = [...this.newSectionArray()];
//     if (!sections[sectionIndex]) return;
//     sections[sectionIndex].collapsed = !sections[sectionIndex].collapsed;
//     this.newSectionArray.set(sections);
//     this.saveTasksInStorage();
//   }

//   // Section tasks
//   makeDeleteVisibleAddedSection(sectionIndex: number, taskIndex: number) {
//     const sections = [...this.newSectionArray()];
//     if (!sections[sectionIndex]?.tasks[taskIndex]) return;
//     const t = sections[sectionIndex].tasks[taskIndex];
//     sections[sectionIndex].tasks[taskIndex] = { ...t, marked: !t.marked };
//     this.newSectionArray.set(sections);
//     this.saveTasksInStorage();
//   }

//   deleteTaskFromSection(sectionIndex: number, taskIndex: number) {
//     const sections = [...this.newSectionArray()];
//     const t = sections[sectionIndex]?.tasks?.[taskIndex];
//     if (!t) return;
//     this.lastDeleted = {
//       task: t,
//       index: taskIndex,
//       fromToday: true,
//       fromSection: sectionIndex,
//     };
//     sections[sectionIndex].tasks.splice(taskIndex, 1);
//     this.newSectionArray.set(sections);
//     this.showUndoMessage.set(true);
//     clearTimeout(this.undoTimeout);
//     this.undoTimeout = setTimeout(() => this.finalDelete(), 5000);
//     this.saveTasksInStorage();
//   }

//   editTaskFromSection(sectionIndex: number, taskIndex: number) {
//     const sections = [...this.newSectionArray()];
//     const t = sections[sectionIndex]?.tasks?.[taskIndex];
//     if (!t) return;
//     sections[sectionIndex].tasks[taskIndex] = {
//       ...t,
//       saved: true,
//       marked: false,
//     };
//     this.newSectionArray.set(sections);
//     this.saveTasksInStorage();
//   }

//   saveTaskFromSection(
//     sectionIndex: number,
//     taskIndex: number,
//     originalTaskText: string
//   ) {
//     const sections = [...this.newSectionArray()];
//     const t = sections[sectionIndex]?.tasks?.[taskIndex];
//     if (!t) return;
//     const text = t.task.trim() ? t.task : originalTaskText;
//     sections[sectionIndex].tasks[taskIndex] = {
//       ...t,
//       task: text,
//       saved: false,
//     };
//     this.newSectionArray.set(sections);
//     this.saveTasksInStorage();
//   }

//   // ======= DRAG & DROP =======
//   onDragStart(index: number, from: string) {
//     this.draggedTaskIndex = index;
//     this.draggedFrom = from;
//   }

//   onDragOver(event: DragEvent) {
//     event.preventDefault();
//     if (this.draggedFrom) {
//       const target = event.currentTarget as HTMLElement;
//       target.classList.add('drag-over');
//       setTimeout(() => target.classList.remove('drag-over'), 100);
//     }
//   }

//   getDropIndex(
//     event: DragEvent,
//     listName: 'tasks' | 'todayTasks' | 'section',
//     sectionIndex?: number
//   ): number | undefined {
//     if (!this.draggedFrom) return undefined;

//     if (listName === 'tasks' && this.draggedFrom === 'tasks') {
//       return this.calculateDropIndex(event, this.tasks());
//     } else if (listName === 'todayTasks' && this.draggedFrom === 'todayTasks') {
//       return this.calculateDropIndex(event, this.todayTasks());
//     } else if (
//       listName === 'section' &&
//       sectionIndex !== undefined &&
//       this.draggedFrom === `section-${sectionIndex}`
//     ) {
//       const sections = this.newSectionArray();
//       return this.calculateDropIndex(event, sections[sectionIndex].tasks);
//     }
//     return undefined;
//   }

//   private calculateDropIndex(event: DragEvent, taskList: Task[]): number {
//     const target = event.currentTarget as HTMLElement;
//     const rect = target.getBoundingClientRect();
//     const y = event.clientY - rect.top;
//     const taskElements = target.querySelectorAll('.task-div');
//     let dropIndex = taskList.length;

//     for (let i = 0; i < taskElements.length; i++) {
//       const taskElement = taskElements[i] as HTMLElement;
//       const taskRect = taskElement.getBoundingClientRect();
//       const taskTop = taskRect.top - rect.top;
//       const taskBottom = taskRect.bottom - rect.top;

//       if (y >= taskTop && y <= taskBottom) {
//         dropIndex = y < (taskTop + taskBottom) / 2 ? i : i + 1;
//         break;
//       }
//     }
//     return dropIndex;
//   }

//   dropTaskToSection(targetSectionIndex: number, dropIndex?: number) {
//     if (this.draggedFrom == null || this.draggedTaskIndex == null) return;
//     let taskToMove: Task | undefined;

//     if (this.draggedFrom === 'tasks') {
//       const src = [...this.tasks()];
//       taskToMove = src[this.draggedTaskIndex];
//       src.splice(this.draggedTaskIndex, 1);
//       this.tasks.set(src);
//     } else if (this.draggedFrom === 'todayTasks') {
//       const src = [...this.todayTasks()];
//       taskToMove = src[this.draggedTaskIndex];
//       src.splice(this.draggedTaskIndex, 1);
//       this.todayTasks.set(src);
//     } else if (this.draggedFrom.startsWith('section-')) {
//       const sourceSectionIndex = parseInt(this.draggedFrom.split('-')[1], 10);
//       const sections = [...this.newSectionArray()];
//       if (sections[sourceSectionIndex]) {
//         taskToMove = sections[sourceSectionIndex].tasks[this.draggedTaskIndex];
//         sections[sourceSectionIndex].tasks.splice(this.draggedTaskIndex, 1);
//         this.newSectionArray.set(sections);
//       }
//     }

//     if (taskToMove) {
//       const sections = [...this.newSectionArray()];
//       if (sections[targetSectionIndex]) {
//         if (
//           dropIndex !== undefined &&
//           this.draggedFrom === `section-${targetSectionIndex}`
//         ) {
//           sections[targetSectionIndex].tasks.splice(dropIndex, 0, taskToMove);
//         } else {
//           sections[targetSectionIndex].tasks.push(taskToMove);
//         }
//         this.newSectionArray.set(sections);
//       }
//     }

//     this.draggedTaskIndex = null;
//     this.draggedFrom = null;
//     this.saveTasksInStorage();
//   }

//   dropTaskToMainList(
//     targetListName: 'tasks' | 'todayTasks',
//     dropIndex?: number
//   ) {
//     if (this.draggedFrom == null || this.draggedTaskIndex == null) return;
//     let taskToMove: Task | undefined;

//     if (this.draggedFrom === 'tasks') {
//       const src = [...this.tasks()];
//       taskToMove = src[this.draggedTaskIndex];
//       src.splice(this.draggedTaskIndex, 1);
//       this.tasks.set(src);
//     } else if (this.draggedFrom === 'todayTasks') {
//       const src = [...this.todayTasks()];
//       taskToMove = src[this.draggedTaskIndex];
//       src.splice(this.draggedTaskIndex, 1);
//       this.todayTasks.set(src);
//     } else if (this.draggedFrom.startsWith('section-')) {
//       const sourceSectionIndex = parseInt(this.draggedFrom.split('-')[1], 10);
//       const sections = [...this.newSectionArray()];
//       if (sections[sourceSectionIndex]) {
//         taskToMove = sections[sourceSectionIndex].tasks[this.draggedTaskIndex];
//         sections[sourceSectionIndex].tasks.splice(this.draggedTaskIndex, 1);
//         this.newSectionArray.set(sections);
//       }
//     }

//     if (taskToMove) {
//       if (targetListName === 'tasks') {
//         const list = [...this.tasks()];
//         if (dropIndex !== undefined && this.draggedFrom === 'tasks') {
//           list.splice(dropIndex, 0, taskToMove);
//         } else {
//           list.push(taskToMove);
//         }
//         this.tasks.set(list);
//       } else {
//         const list = [...this.todayTasks()];
//         if (dropIndex !== undefined && this.draggedFrom === 'todayTasks') {
//           list.splice(dropIndex, 0, taskToMove);
//         } else {
//           list.push(taskToMove);
//         }
//         this.todayTasks.set(list);
//       }
//     }

//     this.draggedTaskIndex = null;
//     this.draggedFrom = null;
//     this.saveTasksInStorage();
//   }

//   reorderTaskInList(
//     listName: 'tasks' | 'todayTasks' | 'section',
//     sourceIndex: number,
//     targetIndex: number,
//     sectionIndex?: number
//   ) {
//     if (listName === 'tasks') {
//       const list = [...this.tasks()];
//       const [taskToMove] = list.splice(sourceIndex, 1);
//       list.splice(targetIndex, 0, taskToMove);
//       this.tasks.set(list);
//     } else if (listName === 'todayTasks') {
//       const list = [...this.todayTasks()];
//       const [taskToMove] = list.splice(sourceIndex, 1);
//       list.splice(targetIndex, 0, taskToMove);
//       this.todayTasks.set(list);
//     } else if (listName === 'section' && sectionIndex !== undefined) {
//       const sections = [...this.newSectionArray()];
//       const s = sections[sectionIndex].tasks;
//       const [taskToMove] = s.splice(sourceIndex, 1);
//       s.splice(targetIndex, 0, taskToMove);
//       this.newSectionArray.set(sections);
//     }
//     this.saveTasksInStorage();
//   }

//   onDragStartFromSection(taskIndex: number, sectionIndex: number) {
//     this.draggedTaskIndex = taskIndex;
//     this.draggedFrom = `section-${sectionIndex}`;
//   }

//   // ======= UNDO =======
//   undoDelete() {
//     if (!this.lastDeleted) return;

//     if (this.lastDeleted.fromToday) {
//       if (this.lastDeleted.fromSection !== undefined) {
//         const sections = [...this.newSectionArray()];
//         sections[this.lastDeleted.fromSection].tasks.splice(
//           this.lastDeleted.index,
//           0,
//           this.lastDeleted.task
//         );
//         this.newSectionArray.set(sections);
//       } else {
//         const list = [...this.todayTasks()];
//         list.splice(this.lastDeleted.index, 0, this.lastDeleted.task);
//         this.todayTasks.set(list);
//       }
//     } else {
//       const list = [...this.tasks()];
//       list.splice(this.lastDeleted.index, 0, this.lastDeleted.task);
//       this.tasks.set(list);
//     }

//     this.lastDeleted = null;
//     this.showUndoMessage.set(false);
//     clearTimeout(this.undoTimeout);
//     this.saveTasksInStorage();
//   }

//   finalDelete() {
//     this.lastDeleted = null;
//     this.showUndoMessage.set(false);
//     this.saveTasksInStorage();
//   }

//   closeUndo() {
//     this.showUndoMessage.set(false);
//   }

//   // ======= COLORS =======
//   showColors() {
//     this.changeColors.set(!this.changeColors());
//   }
//   changeSec1Color(color: string) {
//     this.sec1Color.set(color);
//     this.changeColors.set(false);
//     this.saveTasksInStorage();
//   }

//   showColorsLista() {
//     this.changeListsColor.set(!this.changeListsColor());
//   }
//   changeSec2Color(color: string) {
//     this.sec2Color.set(color);
//     this.changeListsColor.set(false);
//     this.saveTasksInStorage();
//   }

//   showColorsToday() {
//     this.changeTodayColor.set(!this.changeTodayColor());
//   }
//   changeSecTodayColor(color: string) {
//     this.secTodayColor.set(color);
//     this.changeTodayColor.set(false);
//     this.saveTasksInStorage();
//   }

//   showSectionColorPicker(index: number) {
//     const flags = [...this.showSectionColors()];
//     flags[index] = !flags[index];
//     this.showSectionColors.set(flags);
//   }

//   changeSectionColor(index: number, color: string) {
//     const sections = [...this.newSectionArray()];
//     if (!sections[index]) return;
//     sections[index].color = color;
//     this.newSectionArray.set(sections);

//     const flags = [...this.showSectionColors()];
//     flags[index] = false;
//     this.showSectionColors.set(flags);

//     this.saveTasksInStorage();
//   }
// }
