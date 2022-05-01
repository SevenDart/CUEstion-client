import {Component, OnInit} from '@angular/core';
import {QuestionsService} from '../../services/questions.service';
import {Question} from '../../Models/Question';

@Component({
  selector: 'home-page',
  templateUrl: './homepage.component.html',
  styleUrls: [ './homepage.component.scss' ],
  providers: [QuestionsService]
})
export class HomePageComponent implements OnInit {
  popularQuestions: Question[];
  popularQuestionsCount = 10;

  displayedColumns: string[] = ['rate', 'header', 'last-update'];

  constructor(private questionService: QuestionsService) {
  }

  ngOnInit(): void {
    this.questionService.GetHotQuestions(this.popularQuestionsCount).subscribe(
      (questions: Question[]) => {
        this.popularQuestions = questions;
      }
    );
  }


}
