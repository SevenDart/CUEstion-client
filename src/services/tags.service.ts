import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  constructor(private http: HttpClient) {
  }

  GetAllTags() {
    return this.http.get<string[]>(environment.serverAddress + '/tags');
  }

  CreateTag(tag: string) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    tag = encodeURIComponent(tag);
    return this.http.post(encodeURI(environment.serverAddress + `/tags?tag=${tag}`), null, options);
  }

  UpdateTag(oldTag: string, newTag: string) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    oldTag = encodeURIComponent(oldTag);
    newTag = encodeURIComponent(newTag);
    return this.http.put(environment.serverAddress + `/tags?oldTag=${oldTag}&newTag=${newTag}`, null, options);
  }

  DeleteTag(tag: string) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + localStorage.getItem('token')
      })
    };

    tag = encodeURIComponent(tag);
    return this.http.delete(environment.serverAddress + `/tags?tag=${tag}`, options);
  }
}
