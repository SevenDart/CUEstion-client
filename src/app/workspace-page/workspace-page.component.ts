import {Component, OnInit} from '@angular/core';
import {Workspace} from '../../Models/Workspace';
import {WorkspaceUser} from '../../Models/WorkspaceUser';
import {WorkspacesService} from '../../services/workspaces.service';
import {WorkspaceRolesService} from '../../services/workspaceRoles.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {WorkspaceRole} from '../../Models/WorkspaceRole';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../Models/User';
import {UsersService} from '../../services/users.service';
import {catchError, map, startWith} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'workspace-page',
  templateUrl: 'workspace-page.component.html',
  styleUrls: ['workspace-page.component.scss']
})
export class WorkspacePageComponent implements OnInit {
  currentRole: WorkspaceRole;
  workspace: Workspace;
  allUsers: User[];

  newWorkspaceUser = new FormControl('', [Validators.required]);
  newWorkspaceUserRole = new FormControl('', [Validators.required]);
  selectedUserId: number;
  selectedRoleId: number;
  filteredRoles: WorkspaceRole[];
  filteredUsers: User[];

  workspaceUsersDataSource: MatTableDataSource<WorkspaceUser> = new MatTableDataSource<WorkspaceUser>([]);
  workspaceUsers: WorkspaceUser[];
  workspaceUsersForms = [];
  workspaceUsersDisplayColumns = ['rate', 'username', 'role', 'actions'];

  workspaceRolesDataSource: MatTableDataSource<WorkspaceRole> = new MatTableDataSource<WorkspaceRole>([]);
  workspaceRoles: WorkspaceRole[];
  workspaceRolesForms = [];
  workspaceRolesDisplayColumns = ['workspace-role', 'canCreate', 'canUpdate', 'canDelete', 'canAddUsers', 'canManageRoles', 'actions'];
  newWorkspaceRoleGroup = new FormGroup({
    role: new FormControl('', [Validators.required]),
    canCreate: new FormControl(false, [Validators.required]),
    canUpdate: new FormControl(false, [Validators.required]),
    canDelete: new FormControl(false, [Validators.required]),
    canAddUsers: new FormControl(false, [Validators.required]),
    canManageRoles: new FormControl(false, [Validators.required])
  });

  constructor(private activatedRoute: ActivatedRoute,
              private readonly workspacesService: WorkspacesService,
              private readonly workspaceRolesService: WorkspaceRolesService,
              private readonly usersService: UsersService,
              private readonly snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(
      (paramMap: ParamMap) => {
        const workspaceId = Number(paramMap.get('id'));
        this.getWorkspace(workspaceId);
        this.workspaceRolesService
          .GetWorkspaceRoleById(workspaceId, Number(localStorage.getItem('workspaceRoleId')))
          .subscribe(
            (role: WorkspaceRole) => {
              this.currentRole = role;
            }
          );
      }
    );
    this.newWorkspaceUserRole.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRoles(value)),
    ).subscribe(
      (roles: WorkspaceRole[]) => {
        this.filteredRoles = roles;
      }
    );
    this.newWorkspaceUser.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value)),
    ).subscribe(
      (users: User[]) => {
        this.filteredUsers = users;
      }
    );
  }

  getWorkspace(workspaceId: number) {
    this.workspacesService.GetWorkspaceById(workspaceId).subscribe(
      (workspace: Workspace) => {
        this.workspace = workspace;
        this.getWorkspaceUsers(workspaceId);
        this.getWorkspaceRoles(workspaceId);
      }
    );
  }

  getAllUsers() {
    this.usersService.getAllUsers().subscribe(
      (users: User[]) => {
        this.allUsers = users.filter(u => !this.workspaceUsers.find(wu => wu.userId === u.id));
        this.filteredUsers = this.allUsers;
      }
    );
  }

  getWorkspaceUsers(workspaceId: number) {
    this.workspacesService.GetWorkspaceUsers(workspaceId).subscribe(
      (workspaceUsers: WorkspaceUser[]) => {
        this.getAllUsers();
        this.workspaceUsers = workspaceUsers;
        this.workspaceUsersDataSource = new MatTableDataSource<WorkspaceUser>(workspaceUsers);
        for (const wu of workspaceUsers) {
          this.workspaceUsersForms[wu.userId] = {
            isEditing: false,
            newSelectedRoleId: wu.workspaceRoleId
          };
        }
      }
    );
  }

  getWorkspaceRoles(workspaceId: number) {
    this.workspaceRolesService.GetWorkspaceRoles(workspaceId).subscribe(
      (workspaceRoles: WorkspaceRole[]) => {
        this.workspaceRoles = workspaceRoles;
        this.filteredRoles = workspaceRoles;
        this.workspaceRolesDataSource = new MatTableDataSource<WorkspaceRole>(workspaceRoles);
        for (const wr of workspaceRoles) {
          this.workspaceRolesForms[wr.id] = {
            isEditing: false,
            form: new FormGroup({
              role: new FormControl(wr.role, [Validators.required]),
              canCreate: new FormControl(wr.canCreate, [Validators.required]),
              canUpdate: new FormControl(wr.canUpdate, [Validators.required]),
              canDelete: new FormControl(wr.canDelete, [Validators.required]),
              canAddUsers: new FormControl(wr.canAddUsers, [Validators.required]),
              canManageRoles: new FormControl(wr.canManageRoles, [Validators.required]),
            })
          };
        }
      }
    );
  }

  createWorkspaceRole() {
    this.workspaceRolesService.AddWorkspaceRole(
      this.workspace.id,
      this.newWorkspaceRoleGroup.get('role').value,
      this.newWorkspaceRoleGroup.get('canCreate').value,
      this.newWorkspaceRoleGroup.get('canUpdate').value,
      this.newWorkspaceRoleGroup.get('canDelete').value,
      this.newWorkspaceRoleGroup.get('canAddUsers').value,
      this.newWorkspaceRoleGroup.get('canManageRoles').value
    ).subscribe(
      () => {
        this.getWorkspaceRoles(this.workspace.id);
        this.newWorkspaceRoleGroup.get('role').setValue('');
        this.newWorkspaceRoleGroup.get('canCreate').setValue(false);
        this.newWorkspaceRoleGroup.get('canUpdate').setValue(false);
        this.newWorkspaceRoleGroup.get('canDelete').setValue(false);
        this.newWorkspaceRoleGroup.get('canAddUsers').setValue(false);
        this.newWorkspaceRoleGroup.get('canManageRoles').setValue(false);
      }
    );
  }

  updateWorkspaceRole(roleId: number) {
    if (this.workspaceRolesForms[roleId].isEditing) {
      this.workspaceRolesService.UpdateWorkspaceRole(
        this.workspace.id,
        roleId,
        this.workspaceRolesForms[roleId].form.get('role').value,
        this.workspaceRolesForms[roleId].form.get('canCreate').value,
        this.workspaceRolesForms[roleId].form.get('canUpdate').value,
        this.workspaceRolesForms[roleId].form.get('canDelete').value,
        this.workspaceRolesForms[roleId].form.get('canAddUsers').value,
        this.workspaceRolesForms[roleId].form.get('canManageRoles').value)
        .subscribe(
          () => {
            this.getWorkspaceRoles(this.workspace.id);
            this.getWorkspaceUsers(this.workspace.id);
          }
        );
    } else {
      this.workspaceRolesForms[roleId].isEditing = true;
    }
  }

  deleteWorkspaceRole(roleId: number) {
    this.workspaceRolesService.DeleteWorkspaceRole(this.workspace.id, roleId)
      .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          const bar = this.snackBar.open(error.error, 'Close', {
            panelClass: ['mat-toolbar', 'mat-warn'],
          });
          bar._dismissAfter(3 * 1000);
          return of([]);
        }
        if (error.status === 409) {
          const bar = this.snackBar.open(error.error, 'Close', {
            panelClass: ['mat-toolbar', 'mat-warn'],
          });
          bar._dismissAfter(3 * 1000);
          return of([]);
        }
        if (error.status === 0) {
          this.snackBar.open('Something is wrong, try, please, later.', '', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          return throwError(() => {
            return new Error('something is wrong');
          });
        }
      }))
      .subscribe(
        () => {
          this.getWorkspaceRoles(this.workspace.id);
        }
      );
  }

  updateWorkspaceUser(userId: number, workspaceRoleId: number) {
    this.workspacesService.UpdateWorkspaceUser(this.workspace.id, userId, workspaceRoleId)
      .subscribe(
        () => {
          this.getWorkspaceUsers(this.workspace.id);
        }
      );
  }

  deleteWorkspaceUser(userId: number) {
    this.workspacesService.RemoveUserFromWorkspace(this.workspace.id, userId)
      .subscribe(
        () => {
          this.getWorkspaceUsers(this.workspace.id);
        }
      );
  }

  changeUpdateFormState(userId: number) {
    if (this.workspaceUsersForms[userId].isEditing) {
      this.updateWorkspaceUser(userId, this.workspaceUsersForms[userId].newSelectedRoleId);
    }
    this.workspaceUsersForms[userId].isEditing = true;
  }

  displayUsername(user: User) {
    return user ? user.username : '';
  }

  displayRole(role: WorkspaceRole) {
    return role ? role.role : '';
  }

  addUserToWorkspace() {
    this.workspacesService.AddUserToWorkspace(this.workspace.id, this.selectedUserId, this.selectedRoleId)
      .subscribe(
        () => {
          this.getWorkspaceUsers(this.workspace.id);
          this.selectedUserId = null;
          this.selectedRoleId = null;
          this.newWorkspaceUser.setValue('');
          this.newWorkspaceUserRole.setValue('');
        }
      );
  }

  private _filterUsers(value: any): User[] {
    if (!value) {
      return this.allUsers;
    }

    let filterValue;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      return [];
    }

    if (!this.allUsers) {
      return [];
    }

    return this.allUsers.filter(option => option.username.toLowerCase().startsWith(filterValue));
  }

  private _filterRoles(value: any): WorkspaceRole[] {
    if (!value) {
      return this.workspaceRoles;
    }

    let filterValue;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      return [];
    }

    if (!this.workspaceRoles) {
      return [];
    }

    return this.workspaceRoles.filter(option => option.role.toLowerCase().startsWith(filterValue));
  }
}
