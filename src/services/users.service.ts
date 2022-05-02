import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../Models/User';
import {Question} from '../Models/Question';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) {
  }

  public static get isExpired() {
    return Date.parse(localStorage.getItem('expiration-time')) < Date.now();
  }

  public static get IsAdmin() {
    return localStorage.getItem('role') === 'admin';
  }

  public static userId: number = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null;

  login(email: string, password: string) {
    const authData = {
      email: email,
      password: password
    };

    return this.http.put(environment.serverAddress + '/users/login', authData);
  }

  getUser(userId: number) {
    return this.http.get<User>(environment.serverAddress + '/users/' + userId);
  }

  register(email: string, password: string) {
    const authData = {
      email: email,
      password: password
    };

    return this.http.post(environment.serverAddress + '/users/register', authData);
  }

  getCreatedQuestions(userId: number) {
    return this.http.get<Question[]>(environment.serverAddress + `/users/${userId}/questions`);
  }
}
