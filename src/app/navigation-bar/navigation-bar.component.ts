import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Workspace} from '../../Models/Workspace';
import {WorkspacesService} from '../../services/workspaces.service';


@Component({
  selector: 'nav-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  workspace: Workspace;

  get isInWorkspace() {
    return !!localStorage.getItem('workspaceId');
  }

  constructor(readonly router: Router,
              private readonly workspacesService: WorkspacesService) {
  }

  ngOnInit(): void {
    const workspaceId = localStorage.getItem('workspaceId');
    if (workspaceId) {
      this.workspacesService.GetWorkspaceById(Number(workspaceId))
        .subscribe(
          (workspace: Workspace) => {
            this.workspace = workspace;
          }
        );
    }
  }
}
