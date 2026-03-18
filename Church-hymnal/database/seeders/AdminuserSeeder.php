<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'onyangolamek7@gmail.com'],
            [
                'name'     => 'Lamek Onyango',
                'email'    => 'onyangolamek7@gmail.com',
                'diocese'  => 'Head Office',
                'password' => Hash::make('Admin@1234'),
                'role'     => 'admin',
            ]
        );

        $this->command->info('✅ Admin user created:');
        $this->command->info('   Name    : Lamek Onyango');
        $this->command->info('   Email   : onyangolamek7@gmail.com');
        $this->command->info('   Password: Admin@1234');
        $this->command->warn('   ⚠️  Change the password after first login!');
    }
}
