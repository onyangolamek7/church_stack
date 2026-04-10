import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HymnsService } from '../../services/hymns.service';
import { AuthService } from '../../services/auth';
import { Hymn } from '../../models/hymn.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-hymn-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hymn-detail.html',
  styleUrls: ['./hymn-detail.css'],
})
export class HymnDetail implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  hymnsService = inject(HymnsService);
  auth = inject(AuthService);

  hymn = signal<Hymn | null>(null);
  verses = signal<string[][]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Hymn ID from route:', id);

    this.hymnsService.getHymn(id).subscribe({
      next: (data) => {
        console.log('Hymn data:', data);
        this.hymn.set(data);
        console.log('Raw lyrics:', JSON.stringify(data.lyrics));
        this.verses.set(this.prepareVerses(data.lyrics));
        console.log('Verses parsed:', this.verses);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load hymn');
        this.loading.set(false);
      }
    });
  }

  prepareVerses(lyrics: string): string[][] {
    return [lyrics.split('\n').filter(l => l.trim().length > 0)];
  }

  goBack(): void {
    this.router.navigate(['/hymns']);
  }

  toggleFavorite(): void {
    const h = this.hymn();
    if (!h) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (h.isFavorite) {
      this.hymnsService.unfavoriteHymn(h.id).subscribe(() => {
        this.hymn.set({ ...h, isFavorite: false });
      });

    } else {
      this.hymnsService.favoriteHymn(h.id).subscribe(() => {
        this.hymn.set({ ...h, isFavorite: true });
      });
    }
  }

}
