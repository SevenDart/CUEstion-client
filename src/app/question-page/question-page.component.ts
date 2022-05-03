import {Component, OnInit} from '@angular/core';
import {Question} from '../../Models/Question';
import {Observable, of, throwError} from 'rxjs';
import {Answer} from '../../Models/Answer';
import {QuestionsService} from '../../services/questions.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {AppComment} from '../../Models/AppComment';
import {FormControl, Validators} from '@angular/forms';
import {UsersService} from '../../services/users.service';
import {catchError} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {AnswersService} from '../../services/answers.service';
import {CommentsService} from '../../services/comments.service';
import {WorkspaceRole} from '../../Models/WorkspaceRole';
import {WorkspacesService} from '../../services/workspaces.service';
import {WorkspaceUser} from '../../Models/WorkspaceUser';


@Component({
  selector: 'question-page',
  templateUrl: 'question-page.component.html',
  styleUrls: ['question-page.component.css'],
  providers: [QuestionsService]
})
export class QuestionPageComponent implements OnInit {
  currentRole: WorkspaceRole;
  questionVotingExpanded = false;
  question: Question;

  answersForms = [];
  commentForms = [];

  answerControl: FormControl = new FormControl('',
    [Validators.required, Validators.minLength(15), Validators.maxLength(2000)]);
  commentControl: FormControl = new FormControl('',
    [Validators.required, Validators.minLength(10), Validators.maxLength(200)]);


  constructor(private questionsService: QuestionsService,
              private answersService: AnswersService,
              private commentsService: CommentsService,
              private workspacesService: WorkspacesService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  get isAuthed() {
    return UsersService.userId !== null;
  }

  get isAdmin() {
    return UsersService.IsAdmin;
  }

  get isOwner() {
    return UsersService.userId === this.question.user.id;
  }

  get canCreate() {
    const userId = localStorage.getItem('userId');
    const workspaceId = localStorage.getItem('workspaceId');

    if (!userId) {
      return false;
    }

    if (workspaceId) {
      return !!this.currentRole && this.currentRole.canCreate;
    } else {
      return true;
    }
  }

  canUpdate(item: any) {
    const userId = localStorage.getItem('userId');
    const workspaceId = localStorage.getItem('workspaceId');

    if (!userId) {
      return false;
    }

    console.log(this.currentRole);

    if (workspaceId) {
      return !!this.currentRole && this.currentRole.canUpdate;
    } else {
      return userId === item.userId || localStorage.getItem('role') === 'admin';
    }
  }

  canDelete(item: any) {
    const userId = localStorage.getItem('userId');
    const workspaceId = localStorage.getItem('workspaceId');

    if (!userId) {
      return false;
    }

    if (workspaceId) {
      return !!this.currentRole && this.currentRole.canDelete;
    } else {
      return userId === item.userId || localStorage.getItem('role') === 'admin';
    }
  }

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    const workspaceId = localStorage.getItem('workspaceId');
    if (workspaceId && userId) {
      this.workspacesService.GetWorkspaceUser(Number(workspaceId), Number(userId))
        .subscribe(
          (wu: WorkspaceUser) => {
            this.currentRole = wu.workspaceRole;
          }
        );
    }
    this.activatedRoute.paramMap.subscribe((map: ParamMap) => {
      const id: number = Number(map.get('id'));
      this.questionsService.GetQuestion(id).subscribe((question: Question) => {
        this.question = question;
        this.loadAnswers();
      });
      this.loadQuestionComments(id);
    });
  }

  loadAnswers() {
    this.answersService.GetAnswersForQuestion(this.question.id)
      .subscribe((answers: Answer[]) => {
        for (const answer of answers) {
          this.answersForms[answer.id] = {
            get isOwner() {
              return UsersService.userId === answer.user.id;
            },
            rate: answer.rate,
            isEditing: false,
            votingExpanded: false,
            editFormControl: new FormControl('',
              [Validators.required, Validators.maxLength(500 - answer.text.length - 8)]),
            addCommentFormControl: new FormControl('',
              [Validators.required, Validators.minLength(10), Validators.maxLength(200)])
          };
          this.loadAnswerComments(answer);
        }
        this.question.answers = answers;
      });
  }

  addAnswer() {
    this.answersService.AddAnswer(this.question.id, this.answerControl.value).pipe(
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
    ).subscribe((data) => {
      if (data === null) {
        this.loadAnswers();
        this.answerControl.reset();
      }
    });
  }

  updateAnswer(answerId: number, originText: string) {
    this.answersService.UpdateAnswer(this.question.id, answerId,
      (originText + (this.answersForms[answerId].editFormControl.value.length > 0
        ? ' [UPD.] ' + this.answersForms[answerId].editFormControl.value
        : '')))
      .pipe(
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
      ).subscribe((data) => {
        if (data === null) {
          this.loadAnswers();
          this.answersForms[answerId].editFormControl.reset();
        }
      }
    );
  }

  deleteAnswer(answerId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        header: 'Do you want to delete this answer?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.answersService.DeleteAnswer(this.question.id, answerId).pipe(
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
        ).subscribe((data) => {
          if (data === null) {
            this.loadAnswers();
          }
        });
      }
    });
  }

  loadQuestionComments(questionId: number) {
    this.commentsService.GetCommentsForQuestion(questionId)
      .subscribe((comments: AppComment[]) => {
        for (const comment of comments) {
          this.commentForms[comment.id] = {
            get isOwner() {
              return UsersService.userId === comment.user.id;
            },
            rate: comment.rate,
            isEditing: false,
            votingExpanded: false,
            editFormControl: new FormControl('',
              [Validators.required, Validators.maxLength(200 - comment.text.length - 8)]),
          };
        }
        this.question.comments = comments;
      });
  }

  loadAnswerComments(answer: Answer) {
    this.commentsService.GetCommentsForAnswer(this.question.id, answer.id).subscribe((comments: AppComment[]) => {
      for (const comment of comments) {
        this.commentForms[comment.id] = {
          get isOwner() {
            return UsersService.userId === comment.user.id;
          },
          rate: comment.rate,
          isEditing: false,
          votingExpanded: false,
          editFormControl: new FormControl('',
            [Validators.required, Validators.maxLength(200 - comment.text.length)]),
        };
      }
      answer.comments = comments;
    });
  }

  addComment(questionId: number, answerId: number, commentControl: FormControl) {
    this.commentsService.CreateComment(this.question.id, answerId, commentControl.value).pipe(
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
    ).subscribe((data) => {
      if (data === null) {
        if (answerId != null) {
          this.loadAnswerComments(this.question.answers.find(a => a.id === answerId));
        } else {
          this.loadQuestionComments(questionId);
        }

        commentControl.reset();
      }
    });
  }

  updateComment(questionId: number, answerId: number, commentId: number, originText: string) {
    this.commentsService.UpdateComment(this.question.id, answerId, commentId,
      (originText + (this.commentForms[commentId].editFormControl.value.length > 0
        ? ' [UPD.] ' + this.commentForms[commentId].editFormControl.value
        : '')))
      .pipe(
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
      ).subscribe((data) => {
        if (data === null) {
          if (answerId != null) {
            this.loadAnswerComments(this.question.answers.find(a => a.id === answerId));
          } else {
            this.loadQuestionComments(questionId);
          }
        }
      }
    );
  }

  deleteComment(questionId: number, answerId: number, commentId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        header: 'Do you want to delete this comment?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.commentsService.DeleteComment(this.question.id, answerId, commentId).pipe(
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
        ).subscribe((data) => {
          if (data === null) {
            if (answerId != null) {
              this.loadAnswerComments(this.question.answers.find(a => a.id === answerId));
            } else {
              this.loadQuestionComments(questionId);
            }
          }
        });
      }
    });
  }

  upvoteForElement(questionId: number, answerId: number, commentId: number) {
    const type = (commentId !== null) ? 'comment' : (answerId !== null) ? 'answer' : 'question';
    const result: Observable<any> = this.questionsService.UpvoteElement(this.question.id, answerId, commentId);
    result.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.snackBar.open('Something is wrong, try, please, later.', '', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          return throwError(() => {
            return new Error('something is wrong');
          });
        }
        let message: string;
        switch (error.status) {
          case 401:
            message = `Please, log in to upvote this ${type}.`;
            break;
          case 500:
            message = `You have already upvoted this ${type}.`;
            break;
        }
        const bar = this.snackBar.open(message, 'Close', {
          panelClass: ['mat-toolbar', 'mat-warn'],
        });
        bar._dismissAfter(3 * 1000);
        return of([]);
      })
    ).subscribe((data) => {
      if (data === null) {
        switch (type) {
          case 'question':
            this.question.rate++;
            break;
          case 'answer':
            this.answersForms[answerId].rate++;
            break;
          case 'comment':
            this.commentForms[commentId].rate++;
            break;
        }
      }
    });
  }

  downvoteForElement(questionId: number, answerId: number, commentId: number) {
    const type = (commentId !== null) ? 'comment' : (answerId !== null) ? 'answer' : 'question';
    const result = this.questionsService.DownvoteElement(questionId, answerId, commentId);
    result.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.snackBar.open('Something is wrong, try, please, later.', '', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          return throwError(() => {
            return new Error('something is wrong');
          });
        }
        let message: string;
        switch (error.status) {
          case 401:
            message = `Please, log in to downvote this ${type}.`;
            break;
          case 500:
            message = `You have already downvoted this ${type}.`;
            break;
        }
        const bar = this.snackBar.open(message, 'Close', {
          panelClass: ['mat-toolbar', 'mat-warn'],
        });
        bar._dismissAfter(3 * 1000);
        return of([]);
      })
    ).subscribe((data) => {
      if (data === null) {
        switch (type) {
          case 'question':
            this.question.rate--;
            break;
          case 'answer':
            this.answersForms[answerId].rate--;
            break;
          case 'comment':
            this.commentForms[commentId].rate--;
            break;
        }
      }
    });
  }
}
