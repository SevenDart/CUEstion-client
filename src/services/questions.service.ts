import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Question} from '../Models/Question';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  constructor(private http: HttpClient) {
  }

  SearchQuestions(query: string, tags: string[]) {
    let url = environment.serverAddress + '/questions/search' + `?query=${query}`;
    for (const tag of tags) {
      url += `&tags=${encodeURIComponent(tag)}`;
    }
    return this.http.get<Question[]>(url);
  }

  GetHotQuestions(count: number) {
    return this.http.get<Question[]>(environment.serverAddress + '/questions/hot' + `?count=${count}`);
  }

  GetQuestion(id: number) {
    return this.http.get<Question>(environment.serverAddress + `/questions/${id}`);
  }

  CreateQuestion(header: string, description: string, tags: string[]) {
    const question = {
      header: header,
      text: description,
      tags: tags,
      user: {
        id: Number(localStorage.getItem('userId'))
      }
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.post(environment.serverAddress + '/questions', question, options);
  }

  UpdateQuestion(id: number, description: string, tags: string[]) {
    const question = {
      id: id,
      text: description,
      tags: tags,
      user: {
        id: Number(localStorage.getItem('userId'))
      }
    };

    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.put(environment.serverAddress + `/questions/${id}`, question, options);
  }

  DeleteQuestion(questionId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    return this.http.delete(environment.serverAddress + `/questions/${questionId}`, options);
  }

  UpvoteElement(questionId: number, answerId: number, commentId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    if (commentId != null) {
      if (answerId != null) {
        return this.http.put(environment.serverAddress + `/questions/${questionId}/answers/${answerId}/comments/${commentId}/upvote`,
          null, options);
      } else {
        return this.http.put(environment.serverAddress + `/questions/${questionId}/comments/${commentId}/upvote`, null, options);
      }
    } else if (answerId != null) {
      return this.http.put(environment.serverAddress + `/questions/${questionId}/answers/${answerId}/upvote`, null, options);
    } else {
      return this.http.put(environment.serverAddress + `/questions/${questionId}/upvote`, null, options);
    }
  }

  DownvoteElement(questionId: number, answerId: number, commentId: number) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    if (commentId != null) {
      if (answerId != null) {
        return this.http.put(environment.serverAddress + `/questions/${questionId}/answers/${answerId}/comments/${commentId}/downvote`,
          null, options);
      } else {
        return this.http.put(environment.serverAddress + `/questions/${questionId}/comments/${commentId}/downvote`, null, options);
      }
    } else if (answerId != null) {
      return this.http.put(environment.serverAddress + `/questions/${questionId}/answers/${answerId}/downvote`, null, options);
    } else {
      return this.http.put(environment.serverAddress + `/questions/${questionId}/downvote`, null, options);
    }
  }
}
