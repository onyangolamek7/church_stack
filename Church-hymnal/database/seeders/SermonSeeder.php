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

        $hymnModels = collect($hymns)->map(fn ($h) => Hymn::create($h));

        // --- Completed Sermons ---
        $completedSermons = [
            [
                'title'        => 'Walking in the Light',
                'preacher'  => 'Pastor James Osei',
                'description'  => 'An exploration of John 8:12 and what it truly means to follow Christ as the light of the world.',
                'content'      => '<p>In John 8:12, Jesus declares "I am the light of the world." This profound statement invites us to examine our own walk...</p>',
                'service_date' => now()->subWeeks(3)->toDateString(),
                'audio_url'    => 'https://example.com/sermons/walking-in-the-light.mp3',
                'video_url'    => null,
                'status'       => 'completed',
            ],
            [
                'title'        => 'The Bread of Life',
                'preacher'  => 'Elder Ruth Mensah',
                'description'  => 'Drawing from John 6:35, this message unpacks Christ as the sustainer of our spiritual lives.',
                'content'      => '<p>Jesus said, "I am the bread of life; whoever comes to me shall not hunger." What does spiritual sustenance look like today?...</p>',
                'service_date' => now()->subWeeks(2)->toDateString(),
                'audio_url'    => 'https://example.com/sermons/bread-of-life.mp3',
                'video_url'    => 'https://youtube.com/watch?v=example1',
                'status'       => 'completed',
            ],
            [
                'title'        => 'Faith Over Fear',
                'preacher'  => 'Pastor James Osei',
                'description'  => 'A timely message from Matthew 14:22-33 on Peter walking on water and the power of unwavering trust.',
                'content'      => "<p>Peter's bold step onto the water teaches us that faith requires action. When we keep our eyes fixed on Christ...</p>",
                'service_date' => now()->subWeek()->toDateString(),
                'audio_url'    => 'https://example.com/sermons/faith-over-fear.mp3',
                'video_url'    => 'https://youtube.com/watch?v=example2',
                'status'       => 'completed',
            ],
        ];

        foreach ($completedSermons as $i => $data) {
            $sermon = Sermon::create($data);
            // Attach 2 hymns per completed sermon
            $sermon->hymns()->sync([
                $hymnModels[$i]->id     => ['order' => 1],
                $hymnModels[$i + 1]->id => ['order' => 2],
            ]);
        }

        // --- Upcoming Sermon (this week) ---
        Sermon::create([
            'title'        => 'The Good Shepherd',
            'preacher'  => 'Pastor James Osei',
            'description'  => 'Join us this Sunday as we explore Psalm 23 and John 10:11 — the tender care of Christ as our shepherd.',
            'content'      => '<p>The image of a shepherd was deeply familiar to the original audience of Scripture. Yet today...</p>',
            'service_date' => now()->next('Sunday')->toDateString(),
            'audio_url'    => null,
            'video_url'    => null,
            'status'       => 'upcoming',
        ])->hymns()->sync([
            $hymnModels[0]->id => ['order' => 1], // Amazing Grace
            $hymnModels[1]->id => ['order' => 2], // Great Is Thy Faithfulness
            $hymnModels[2]->id => ['order' => 3], // Blessed Assurance
        ]);
    }
}
