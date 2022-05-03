import {Component, OnInit} from '@angular/core';
import {WorkspaceUser} from '../../Models/WorkspaceUser';
import {WorkspacesService} from '../../services/workspaces.service';
import {Workspace} from '../../Models/Workspace';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {WorkspaceRole} from '../../Models/WorkspaceRole';

@Component({
  selector: 'workspaces-list',
  templateUrl: 'workspaces-list.component.html',
  styleUrls: ['workspaces-list.component.scss']
})
export class WorkspacesListComponent implements OnInit {
  userWorkspaces: WorkspaceUser[];

  newWorkspaceCreating: boolean;
  newWorkspaceForm: FormGroup = new FormGroup({
    workspaceName: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required])
  });

  constructor(readonly workspacesService: WorkspacesService,
              private readonly router: Router) {
  }

  ngOnInit(): void {
    this.workspacesService.GetUserWorkspaces().subscribe(
      (workspaces: WorkspaceUser[]) => {
        this.userWorkspaces = workspaces;
      }
    );
  }

  openCreationForm() {
    this.newWorkspaceCreating = !this.newWorkspaceCreating;
    this.newWorkspaceForm.reset();
  }

  canEdit(workspaceUser: WorkspaceUser) {
    return Number(localStorage.getItem('userId')) === workspaceUser.workspace.chiefId
      || workspaceUser.workspaceRole.canAddUsers
      || workspaceUser.workspaceRole.canManageRoles;
  }

  createWorkspace() {
    this.workspacesService.AddWorkspace(this.newWorkspaceForm.get('workspaceName').value, this.newWorkspaceForm.get('description').value)
      .subscribe(
        (workspace: Workspace) => {
          this.router.navigate(['/workspaces/', workspace.id]);
        }
      );
  }

  enterWorkspace(workspace: WorkspaceUser) {
    this.workspacesService.SetCurrentWorkspace(workspace);
    this.router.navigate(['/home']);
  }
}
