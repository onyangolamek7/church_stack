import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
        this.hymns.set(res.data?.hymns ?? []);
        this.sermonLoading.set(false);
      },
      error: () => this.sermonLoading.set(false)
    });
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
