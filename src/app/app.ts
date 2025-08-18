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
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgStyle, NgClass, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  tasks: Task[] = [];
  todayTasks: Task[] = [];
  newTask: string = '';

  ngOnInit() {
    const saved = localStorage.getItem('tasks');
    const savedToday = localStorage.getItem('todayTasks');
    const savedSections = localStorage.getItem('sections');

    if (saved) {
      this.tasks = JSON.parse(saved);
    }

    if (savedToday) {
      this.todayTasks = JSON.parse(savedToday);
    }

    if (savedSections) {
      this.newSectionArray.set(JSON.parse(savedSections));
    }
  }

  private saveTasksInStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('todayTasks', JSON.stringify(this.todayTasks));
    localStorage.setItem('sections', JSON.stringify(this.newSectionArray()));
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

  /////////////////////////////////////////////////////////////////////////////////
  newSectionArray = signal<Section[]>([]);
  sectionTitle = signal<string>('New Section');
  newSection = signal<boolean>(false);

  addSection() {
    if (!this.sectionTitle().trim()) return;

    this.newSection.set(true);

    setTimeout(() => {
      const sections = this.newSectionArray();
      sections.push({
        title: this.sectionTitle().trim(),
        exist: true,
        clickOnTitle: false,
        tasks: [],
        newTask: '', // Initialize newTask
      });
      this.newSectionArray.set([...sections]);
      this.newSection.set(false);
    }, 1000);

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
}
