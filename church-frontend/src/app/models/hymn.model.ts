export interface Hymn {
  id: number;
  number: number;
  title: string;
  lyrics: string;
  created_at: string;
  updated_at: string;

  isFavorite?: boolean;
  verses?: string[][];
}
