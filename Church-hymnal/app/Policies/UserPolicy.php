<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /** Only admins can list all users */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /** Admins can view any user; members can only view themselves */
    public function view(User $user, User $model): bool
    {
        return $user->isAdmin() || $user->id === $model->id;
    }

    /** Only admins can update roles or other users */
    public function update(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /** Only admins can delete users; cannot self-delete */
    public function delete(User $user, User $model): bool
    {
        return $user->isAdmin() && $user->id !== $model->id;
    }
}
