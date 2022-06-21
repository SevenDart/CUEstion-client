import {Component, OnInit} from '@angular/core';
import {User} from '../../Models/User';
import {MatDialog} from '@angular/material/dialog';
import {SignDialogComponent} from './sign-dialog/sign-dialog.component';
import {UsersService} from '../../services/users.service';
import {TagEditorComponent} from '../tag-editor/tag-editor.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'auth-panel',
  templateUrl: 'auth-panel.component.html',
  styleUrls: ['auth-panel.component.css'],
  providers: [UsersService]
})
export class AuthPanelComponent implements OnInit {
  user: User;
  workspaceId: string;

  constructor(public dialog: MatDialog,
              private userService: UsersService,
              private snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit() {
    this.workspaceId = localStorage.getItem('workspaceId');
    this.loadUser();
  }

  get isAuthed() {
    const isExpired = UsersService.isExpired;
    if (localStorage.getItem('userId') !== null) {
      if (isExpired) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('expiration-time');
        localStorage.removeItem('workspaceId');
        this.snackBar.open('Your authentication token expired, please, re-login to continue.', 'close', {
          panelClass: ['mat-toolbar', 'mat-warn']
        })._dismissAfter(3000);
        this.dialog.open(SignDialogComponent, {
          width: '500px'
        }).afterClosed().subscribe(() => {
          this.loadUser();
        });
      }
      return !isExpired;
    } else {
      return false;
    }
  }

  get isAdmin() {
    return UsersService.IsAdmin;
  }

  refreshUser() {
    const id = localStorage.getItem('userId');
    this.userService.getUser(Number(id)).subscribe((user: User) => {
      this.user.rate = user.rate;
    });
  }

  loadUser() {
    const id = localStorage.getItem('userId');
    if (id) {
      this.userService.getUser(Number(id)).subscribe((user: User) => {
        this.user = user;
      });
    }
  }

  exitWorkspace() {
    localStorage.removeItem('workspaceId');
    this.workspaceId = null;
    this.router.navigate(['/home']);
  }

  openLoginWindow() {
    const window = this.dialog.open(SignDialogComponent, {
      width: '500px'
    });
    window.afterClosed().subscribe(() => {
      this.loadUser();
    });
  }

  logout() {
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('expiration-time');
    localStorage.removeItem('workspaceId');
    UsersService.userId = null;
  }

  openTagsWindow() {
    this.dialog.open(TagEditorComponent, {
      width: '40%'
    });
  }
}

