import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SermonService, Sermon } from '../../services/sermon.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private sermonService = inject(SermonService);
  private http = inject(HttpClient);
  private router = inject(Router);

  upcomingSermon = signal<Sermon | null>(null);
  hymns = signal<any[]>([]);
  expandedHymnId = signal<number | null>(null);
  sermonLoading = signal(true);

  ngOnInit(): void {
    // Load next upcoming sermon for widget
    this.sermonService.getNext().subscribe({
      next: (res) => {
        this.upcomingSermon.set(res.data);
        this.sermonLoading.set(false);
      },
      error: () => this.sermonLoading.set(false)
    });

    // Load featured hymns
    this.http.get<any[]>(`${environment.apiUrl}/hymns`)
      .subscribe(res => this.hymns.set(res.slice(0, 5)));
  }

  toggleHymn(id: number): void {
    this.expandedHymnId.set(this.expandedHymnId() === id ? null : id);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  }

  daysUntil(dateStr: string): number {
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.round((new Date(dateStr).getTime() - today.getTime()) / 86400000);
  }

  goToHymn(id: number) { this.router.navigate(['/hymns', id]); }
  goToSermons() { this.router.navigate(['/sermons']); }
}

/*
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
*/
