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
