import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, of, throwError} from 'rxjs';
import {QuestionsService} from '../../services/questions.service';
import {catchError} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Question} from '../../Models/Question';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {WorkspaceRole} from '../../Models/WorkspaceRole';
import {WorkspacesService} from '../../services/workspaces.service';

@Component({
  selector: 'update-question',
  templateUrl: 'update-question.component.html',
  styleUrls: ['update-question.component.css']
})
export class UpdateQuestionComponent implements OnInit {
  questionForm: FormGroup = new FormGroup({
    header: new FormControl(''),
    description: new FormControl('')
  });

  currentRole: WorkspaceRole;
  question: Question;
  selectedTags: string[] = [];

  constructor(private questionService: QuestionsService,
              private workspacesService: WorkspacesService,
              private snackBar: MatSnackBar,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog) {
  }

  get canDelete() {
    if (this.currentRole) {
      return this.currentRole.canDelete;
    } else {
      return true;
    }
  }

  ngOnInit() {
    const workspaceId = localStorage.getItem('workspaceId');
    const userId = localStorage.getItem('userId');
    if (workspaceId) {
      this.workspacesService.GetWorkspaceUser(Number(workspaceId), Number(userId));
    }
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      const id: number = Number(paramMap.get('id'));
      this.questionService.GetQuestion(id).subscribe((question: Question) => {
        this.question = question;
        this.selectedTags = question.tags;
        this.questionForm.get('description').setValidators([Validators.maxLength(3000 - question.text.length - 8)]);
      });
    });
  }

  updateQuestion() {
    this.questionService.UpdateQuestion(this.question.id,
      this.question.text + (this.questionForm.get('description').value.length > 0
        ? ' [UPD.] ' + this.questionForm.get('description').value
        : ''),
      this.selectedTags).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          const bar = this.snackBar.open('Something is wrong, please, try again later.', 'Close', {
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
      })
    ).subscribe(() => {
      this.router.navigate(['/question/', this.question.id]);
    });
  }

  deleteQuestion(questionId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        header: 'Do you want to delete this question?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.questionService.DeleteQuestion(questionId).pipe(
          catchError((error: HttpErrorResponse) => {
              if (error.status === 500) {
                const bar = this.snackBar.open('Something is wrong, please, try again later.', 'Close', {
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
            })
        ).subscribe( (data) => {
          if (data === null) {
            this.router.navigate(['home']);
          }
        });
      }
    });
  }
}
