import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppComment} from '../Models/AppComment';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  constructor(private http: HttpClient) {
  }

  CreateComment(questionId: number, answerId: number, text: string) {
    const comment = {
      text: text,
      questionId: questionId,
      answerId: answerId,
      user: {
        id: Number(localStorage.getItem('userId'))
      }
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    if (answerId != null) {
      return this.http.post(environment.serverAddress + `/questions/${questionId}/answers/${answerId}/comments`, comment, options);
    } else {
      return this.http.post(environment.serverAddress + `/questions/${questionId}/comments`, comment, options);
    }
  }

  UpdateComment(questionId: number, answerId: number, commentId: number, text: string) {
    const comment = {
      id: commentId,
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

    if (answerId != null) {
      return this.http.put(
        environment.serverAddress + `/questions/${questionId}/answers/${answerId}/comments/${commentId}`, comment, options);
    } else {
      return this.http.put(environment.serverAddress + `/questions/${questionId}/comments/${commentId}`, comment, options);
    }
  }

  DeleteComment(questionId: number, answerId: number, commentId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    if (answerId != null) {
      return this.http.delete(environment.serverAddress + `/questions/${questionId}/answers/${answerId}/comments/${commentId}`, options);
    } else {
      return this.http.delete(environment.serverAddress + `/questions/${questionId}/comments/${commentId}`, options);
    }
  }

  GetCommentsForQuestion(id: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<AppComment[]>(`${environment.serverAddress}/questions/${id}/comments`, options);
  }

  GetCommentsForAnswer(questionId: number, answerId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.get<AppComment[]>(`${environment.serverAddress}/questions/${questionId}/answers/${answerId}/comments`, options);
  }
}
