import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../shared/task-service';

@Component({
  selector: 'app-undo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './undo.html',
  styleUrls: ['./undo.scss'],
})
export class UndoComponent {
  constructor(public tasksSrv: TaskService) {}
}
