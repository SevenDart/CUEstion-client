import {Component, ViewChild} from '@angular/core';
import {User} from '../../Models/User';
import {Question} from '../../Models/Question';
import {QuestionsService} from '../../services/questions.service';
import {UsersService} from '../../services/users.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table';


@Component({
  selector: 'user-page',
  templateUrl: 'user-page.component.html',
  styleUrls: ['user-page.component.css']
})
export class UserPageComponent {
  user: User;

  displayedColumns = ['rate', 'header', 'last-update'];

  createdQuestionsDataSource: MatTableDataSource<Question> = new MatTableDataSource<Question>([]);
  @ViewChild('createdPaginator') createdPaginator;
  @ViewChild('subscribedPaginator') subscribedPaginator;

  constructor(questionsService: QuestionsService, usersService: UsersService, activatedRoute: ActivatedRoute) {
    activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = Number(params.get('id'));
      usersService.getUser(id).subscribe((user: User) => {
        this.user = user;
      });
      usersService.getCreatedQuestions(UsersService.userId).subscribe((questions: Question[]) => {
        this.createdQuestionsDataSource = new MatTableDataSource<Question>(questions);
        this.createdQuestionsDataSource.paginator = this.createdPaginator;
      });
    });
  }
}
