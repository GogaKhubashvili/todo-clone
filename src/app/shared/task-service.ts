import { Injectable, signal } from '@angular/core';

// Interfaces to define the data structures
export interface Task {
  id: string;
  title: string;
  isMarked: boolean;
  isEditing: boolean;
}

export interface Section {
  id: string;
  title: string;
  tasks: Task[];
  collapsed: boolean;
  isTitleEditing: boolean;
  isColorChanging: boolean;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Main data signals
  tasks = signal<Task[]>([]);
  todayTasks = signal<Task[]>([]);
  newSectionArray = signal<Section[]>([]);

  // Corrected type for undoMessage to allow for Task and string
  undoMessage = signal<{
    show: boolean;
    task: Task | null;
    sectionId: string | null;
  }>({ show: false, task: null, sectionId: null });

  // Other state signals
  loader = signal(true);
  todayExist = signal(true);

  constructor() {
    this.initialLoad();
  }

  // Initial data setup for the application
  initialLoad() {
    // Simulate a network delay
    setTimeout(() => {
      this.tasks.set([
        { id: '1', title: 'Task 1', isMarked: false, isEditing: false },
        { id: '2', title: 'Task 2', isMarked: false, isEditing: false },
        { id: '3', title: 'Task 3', isMarked: false, isEditing: false },
      ]);
      this.todayTasks.set([
        { id: '4', title: 'Today Task 1', isMarked: false, isEditing: false },
        { id: '5', title: 'Today Task 2', isMarked: false, isEditing: false },
      ]);
      this.loader.set(false);
    }, 1000);
  }

  // Core functions for task manipulation
  addTask(title: string, sectionId?: string) {
    if (!title) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      isMarked: false,
      isEditing: false,
    };

    if (sectionId === 'today') {
      this.todayTasks.update((currentTasks) => [...currentTasks, newTask]);
    } else if (sectionId) {
      this.newSectionArray.update((sections) =>
        sections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, tasks: [...sec.tasks, newTask] }
            : sec
        )
      );
    } else {
      this.tasks.update((currentTasks) => [...currentTasks, newTask]);
    }
  }

  deleteTask(taskId: string, sectionId?: string) {
    let taskToDelete: Task | undefined;
    if (sectionId === 'today') {
      const currentTasks = this.todayTasks();
      taskToDelete = currentTasks.find((t) => t.id === taskId);
      this.todayTasks.set(currentTasks.filter((t) => t.id !== taskId));
    } else if (sectionId) {
      this.newSectionArray.update((sections) =>
        sections.map((sec) => {
          if (sec.id === sectionId) {
            taskToDelete = sec.tasks.find((t) => t.id === taskId);
            return { ...sec, tasks: sec.tasks.filter((t) => t.id !== taskId) };
          }
          return sec;
        })
      );
    } else {
      const currentTasks = this.tasks();
      taskToDelete = currentTasks.find((t) => t.id === taskId);
      this.tasks.set(currentTasks.filter((t) => t.id !== taskId));
    }

    if (taskToDelete) {
      this.showUndoMessage(taskToDelete, sectionId!);
    }
  }

  undoDelete(task: Task, sectionId: string | null) {
    if (sectionId === 'today') {
      this.todayTasks.update((currentTasks) => [...currentTasks, task]);
    } else if (sectionId) {
      this.newSectionArray.update((sections) =>
        sections.map((sec) =>
          sec.id === sectionId ? { ...sec, tasks: [...sec.tasks, task] } : sec
        )
      );
    } else {
      this.tasks.update((currentTasks) => [...currentTasks, task]);
    }
    this.undoMessage.set({ show: false, task: null, sectionId: null });
  }

  showUndoMessage(task: Task, sectionId: string | null) {
    this.undoMessage.set({ show: true, task, sectionId });
    setTimeout(() => {
      this.undoMessage.set({ show: false, task: null, sectionId: null });
    }, 5000);
  }

  // Core functions for section manipulation
  addSection(title: string) {
    if (!title) return;
    const newSection: Section = {
      id: crypto.randomUUID(),
      title,
      tasks: [],
      collapsed: false,
      isTitleEditing: false,
      isColorChanging: false,
      color: 'rgb(19, 17, 60)',
    };
    this.newSectionArray.update((sections) => [...sections, newSection]);
  }

  deleteSection(sectionId: string) {
    this.newSectionArray.update((sections) =>
      sections.filter((sec) => sec.id !== sectionId)
    );
  }

  deleteTodaySection() {
    this.todayExist.set(false);
  }

  // Drag and drop logic
  onDragStart(event: DragEvent, taskId: string, sectionId?: string) {
    event.dataTransfer?.setData('text/plain', taskId);
    event.dataTransfer?.setData('sectionId', sectionId || '');
  }

  onDrop(event: DragEvent, targetSectionId?: string) {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain');
    const sourceSectionId = event.dataTransfer?.getData('sectionId');
    if (!taskId) return;

    let taskToMove: Task | undefined;
    let sourceTasks: Task[] | undefined;
    let targetTasks: Task[] | undefined;

    // Determine source tasks
    if (sourceSectionId === 'today') {
      sourceTasks = this.todayTasks();
    } else if (sourceSectionId) {
      sourceTasks = this.newSectionArray().find(
        (s) => s.id === sourceSectionId
      )?.tasks;
    } else {
      sourceTasks = this.tasks();
    }

    if (!sourceTasks) return;
    taskToMove = sourceTasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    // Remove from source
    if (sourceSectionId === 'today') {
      this.todayTasks.set(sourceTasks.filter((t) => t.id !== taskId));
    } else if (sourceSectionId) {
      this.newSectionArray.update((sections) =>
        sections.map((sec) =>
          sec.id === sourceSectionId
            ? { ...sec, tasks: sec.tasks.filter((t) => t.id !== taskId) }
            : sec
        )
      );
    } else {
      this.tasks.set(sourceTasks.filter((t) => t.id !== taskId));
    }

    // Add to target
    if (targetSectionId === 'today') {
      this.todayTasks.update((tasks) => [...tasks, taskToMove!]);
    } else if (targetSectionId) {
      this.newSectionArray.update((sections) =>
        sections.map((sec) =>
          sec.id === targetSectionId
            ? { ...sec, tasks: [...sec.tasks, taskToMove!] }
            : sec
        )
      );
    } else {
      this.tasks.update((tasks) => [...tasks, taskToMove!]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
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
