import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HymnsService } from '../../services/hymns.service';
import { AuthService } from '../../services/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
  //hymnsComponent = inject(HymnsComponent);
  auth = inject(AuthService);

  hymn: Hymn | null = null;

  verses: string[][] = [];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.hymnsService.getHymn(id).subscribe({
      next: (data) => {
        this.hymn = data;
        this.prepareVerses(data.lyrics);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load hymn';
        this.loading = false;
      }
    });
  }

  prepareVerses(lyrics: string) {
    const verses = lyrics.split('\n\n');
    this.verses = verses.map(v => v.split('\n'));
  }

  goBack(): void {
    this.router.navigate(['/hymns']);
  }

  toggleFavorite(): void {
    if (!this.hymn) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.hymn.isFavorite) {
      this.hymnsService.unfavoriteHymn(this.hymn.id).subscribe(() => {
        if (this.hymn) this.hymn.isFavorite = false;
      });

    } else {
      this.hymnsService.favoriteHymn(this.hymn.id).subscribe(() => {
        if (this.hymn) this.hymn.isFavorite = true;
      });
    }
  }

  private idParam = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id')))
  );

  private fetchEffect = effect(() => {
    const id = this.idParam();
    if (!id) return;

    const hymnId = parseInt(id);

    const cached = this.hymnsService.getHymns(hymnId);
  });

}
