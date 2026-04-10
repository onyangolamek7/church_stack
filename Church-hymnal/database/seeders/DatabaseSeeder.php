<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminSeeder::class);
        $this->call(AdminUserSeeder::class);

        User::firstOrCreate([
            'name' => 'Lamek Onyango',
            'email' => 'onyangolamek7@gmail.com',
            'diocese' => 'Head Office',
            'password' => Hash::make('Admin@1234'),
            'role' => 'admin',
        ]);
    }
}
