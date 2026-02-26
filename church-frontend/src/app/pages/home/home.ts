import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  upcomingSermon: any = null;
  pastSermons: any[] = [];
  hymns: any[] = [];

  ngOnInit(): void {

    this.http.get<any>('http://localhost:8000/api/sermons/upcoming')
    .subscribe(response => {
      this.upcomingSermon = response;
    });

    this.http.get<any[]>('http://localhost:8000/api/sermons/past')
    .subscribe(response => {
      this.pastSermons = response;
    });

    this.http.get<any[]>('http://localhost:8000/api/hymns')
    .subscribe(response => {
      this.hymns = response.slice(0, 5);
    });
  }

  goToHymn(id: number) {
    this.router.navigate(['/hymns']);
  }

  goToSermons() {
    this.router.navigate(['/sermons']);
  }

}
