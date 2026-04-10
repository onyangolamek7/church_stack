<?php

namespace Database\Seeders;

use App\Models\Hymn;
use App\Models\Sermon;
use Illuminate\Database\Seeder;

class SermonSeeder extends Seeder
{
    public function run(): void
    {
        // --- Hymns ---
        $hymns = [
            [
                'title'          => 'How Great Thou Art',
                'number'    => '77',
                'lyrics' => "O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.",
            ],
            [
                'title'          => 'Blessed Assurance',
                'number'    => '102',
                'lyrics' => "Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.",
            ],
            [
                'title'          => 'It Is Well with My Soul',
                'number'    => '129',
                'lyrics' => "When peace like a river attendeth my way,\nWhen sorrows like sea billows roll,\nWhatever my lot, Thou hast taught me to say,\n\"It is well, it is well with my soul.\"",
            ],
            [
                'title'          => 'Great Is Thy Faithfulness',
                'number'    => '86',
                'lyrics' => "Great is Thy faithfulness, O God my Father,\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions they fail not;\nAs Thou hast been Thou forever wilt be.",
            ],
        ];

        $hymnModels = collect($hymns)->map(fn ($h) => Hymn::firstOrCreate(['number' => $h['number']], $h));

        // --- Upcoming Sermon (this week) ---
        $sermon = Sermon::firstOrCreate([
            'title'        => 'He is Risen: The Victory of Life Over Death',
            'preacher'  => 'Rev. Yonah Onyango',
            'description'  => 'An Easter sermon reflecting on the resurrection of Jesus Christ, emphasizing hope, renewal, salvation, and eternal life through Christ’s victory over sin and death.',
            'content'      => '<p>Easter Sunday stands at the center of the Christian faith. It is not merely a commemoration of an event in history, but the celebration of a living reality—the resurrection of Jesus Christ.</p>',
            'service_date' => now()->next('Sunday')->toDateString(),
            'audio_url'    => null,
            'video_url'    => null,
            'status'       => 'upcoming',
        ]);

        $sermon->hymns()->sync([
            $hymnModels[0]->id => ['order' => 1], // Amazing Grace
            $hymnModels[1]->id => ['order' => 2], // Great Is Thy Faithfulness
            $hymnModels[2]->id => ['order' => 3], // Blessed Assurance
        ]);
    }
}
