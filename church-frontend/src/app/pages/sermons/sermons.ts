import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Sermon {
  id: number;
  title: string;
  preacher: string;
  description: string;
  service_date: string;
  video_url?: string;
  audio_url?: string;
  is_upcoming: boolean;
}

@Component({
  selector: 'app-sermons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sermons.html',
  styleUrls: ['./sermons.css'],
})
export class Sermons {
  sermons: Sermon[] = [];
  upcoming: Sermon[] = [];

  constructor() {
    this.loadSermons();
    this.loadUpcoming();
  }

  loadSermons() {
    console.log("Loading sermons...");
  }

  loadUpcoming() {
    console.log("Loading upcoming sermons...");
  }

}
