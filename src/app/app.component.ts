import { Component, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tcc-member-db';
  firestore: Firestore = inject(Firestore);
}
