<?php

namespace Database\Seeders;

use App\Models\Hymn;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HymnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Hymn::create([
            'number' => 1,
            'title' => 'Great is Thy Faithfulness',
            'lyrics' => 'Great is Thy Faithfulness O God my Father...'
        ]);
    }
}
