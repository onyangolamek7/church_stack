<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run():void
    {
        User::updateOrCreate(
        ['email'=>'onyangolamek7@gmail.com'],
        [
            'name'=>'Admin Onyango',
            'password'=>Hash::make('password'),
            'role'=>'admin',
        ]
       );
    }
}


