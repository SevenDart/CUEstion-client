import {Component, OnInit} from '@angular/core';
import {QuestionsService} from '../../services/questions.service';
import {Question} from '../../Models/Question';
import {WorkspacesService} from '../../services/workspaces.service';
import {WorkspaceRole} from '../../Models/WorkspaceRole';
import {WorkspaceUser} from '../../Models/WorkspaceUser';

@Component({
  selector: 'home-page',
  templateUrl: './homepage.component.html',
  styleUrls: [ './homepage.component.scss' ]
})
export class HomePageComponent implements OnInit {
  popularQuestions: Question[];
  popularQuestionsCount = 10;
  currentRole: WorkspaceRole;
  displayedColumns: string[] = ['rate', 'header', 'last-update'];

  get canCreate() {
    if (this.currentRole) {
      return this.currentRole.canCreate;
    } else {
      return true;
    }
  }

  constructor(
    private questionService: QuestionsService,
    private workspacesService: WorkspacesService) {
  }

  ngOnInit(): void {
    this.questionService.GetHotQuestions(this.popularQuestionsCount).subscribe(
      (questions: Question[]) => {
        this.popularQuestions = questions;
      }
    );

    const workspaceId = localStorage.getItem('workspaceId');
    const userId = localStorage.getItem('userId');

    this.workspacesService.GetWorkspaceUser(Number(workspaceId), Number(userId))
      .subscribe(
        (wu: WorkspaceUser) => {
          this.currentRole = wu.workspaceRole;
        }
      );
  }
}
