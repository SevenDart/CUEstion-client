import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {of, throwError} from 'rxjs';
import {QuestionsService} from '../../services/questions.service';
import {catchError} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {Question} from '../../Models/Question';

@Component({
  selector: 'create-question',
  templateUrl: 'create-question.component.html',
  styleUrls: ['create-question.component.css'],
  providers: [QuestionsService]
})
export class CreateQuestionComponent {
  questionForm: FormGroup = new FormGroup({
    header: new FormControl('', [Validators.required, Validators.minLength(15), Validators.maxLength(100)]),
    description: new FormControl('', [Validators.required, Validators.minLength(30), Validators.maxLength(3000)])
  });

  selectedTags: string[] = [];

  constructor(private questionService: QuestionsService,
              private snackBar: MatSnackBar,
              private router: Router) {
  }

  createQuestion() {
    this.questionService.CreateQuestion(this.questionForm.get('header').value,
                                        this.questionForm.get('description').value,
                                        this.selectedTags).pipe(
      catchError(catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          const bar = this.snackBar.open('Something is wrong, please, try again later.', 'Close', {
            panelClass: ['mat-toolbar', 'mat-warn'],
          });
          bar._dismissAfter(3 * 1000);
          return of(null);
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
    )
    ).subscribe((data: Question) => {
      if (data) {
        this.router.navigate(['/question/', data.id]);
      }
    });
  }
}
