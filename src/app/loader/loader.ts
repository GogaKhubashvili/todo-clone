import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../shared/task-service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss'],
})
export class LoaderComponent {
  constructor(public tasksSrv: TaskService) {}
}
