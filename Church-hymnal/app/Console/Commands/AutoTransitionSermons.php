<?php

namespace App\Console\Commands;

use App\Models\Sermon;
use Illuminate\Console\Command;

class AutoTransitionSermons extends Command
{
    protected $signature   = 'sermons:transition';
    protected $description = 'Mark upcoming sermons whose service_date has passed as completed';

    public function handle(): int
    {
        $count = Sermon::autoTransitionPastSermons();

        $this->info("Transitioned {$count} sermon(s) from upcoming → completed.");

        return Command::SUCCESS;
    }
}
