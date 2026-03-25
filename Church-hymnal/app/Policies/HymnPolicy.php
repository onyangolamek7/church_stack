<?php

namespace App\Policies;

use App\Models\Hymn;
use App\Models\User;

class HymnPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Hymn $hymn): bool
    {
        return true;
    }

    /** Only admins can create hymns */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Only admins can update hymns */
    public function update(User $user, Hymn $hymn): bool
    {
        return $user->isAdmin();
    }

    /** Only admins can delete hymns */
    public function delete(User $user, Hymn $hymn): bool
    {
        return $user->isAdmin();
    }
}
