import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Answer} from '../Models/Answer';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {
  constructor(private http: HttpClient) {
  }

  GetAnswersForQuestion(id: number) {
    return this.http.get<Answer[]>(environment.serverAddress + `/questions/${id}/answers`);
  }

  AddAnswer(questionId: number, text: string) {
    const answer = {
      text: text,
      user: {
        id: Number(localStorage.getItem('userId'))
      }
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.post(environment.serverAddress + `/questions/${questionId}/answers`, answer, options);
  }

  UpdateAnswer(questionId: number, answerId: number, text: string) {
    const answer = {
      id: answerId,
      text: text,
      user: {
        id: Number(localStorage.getItem('userId'))
      }
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.put(environment.serverAddress + `/questions/${questionId}/answers/${answerId}`, answer, options);
  }

  DeleteAnswer(questionId: number, answerId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.delete(environment.serverAddress + `/questions/${questionId}/answers/${answerId}`, options);
  }
}
