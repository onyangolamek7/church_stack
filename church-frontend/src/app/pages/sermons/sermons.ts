import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SermonService, Sermon } from '../../services/sermon.service';

@Component({
  selector: 'app-sermons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sermons.html',
  styleUrls: ['./sermons.css'],
})
export class Sermons implements OnInit {
  private sermonService = inject(SermonService);

  upcoming = signal<Sermon[]>([]);
  previous = signal<Sermon[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<'upcoming' | 'previous'>('upcoming');
  expandedHymnSermonId = signal<number | null>(null);

  ngOnInit(): void {
    this.sermonService.getAll().subscribe({
      next: (res) => {
        this.upcoming.set(res.upcoming);
        this.previous.set(res.previous);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load sermons. Please try again.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'upcoming' | 'previous'): void {
    this.activeTab.set(tab);
  }

  toggleHymns(sermonId: number): void {
    this.expandedHymnSermonId.set(
      this.expandedHymnSermonId() === sermonId ? null : sermonId
    );
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
