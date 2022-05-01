import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'nav-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  constructor(readonly router: Router) {
  }
}
