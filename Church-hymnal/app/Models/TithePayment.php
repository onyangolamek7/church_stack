<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TithePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payer_name',
        'payer_email',
        'payer_phone',
        'amount',
        'currency',
        'payment_method',
        'status',
        'mpesa_checkout_request_id',
        'mpesa_merchant_request_id',
        'mpesa_transaction_code',
        'mpesa_phone_number',
        'stripe_payment_intent_id',
        'stripe_client_secret',
        'stripe_charge_id',
        'reference',
        'failure_reason',
        'metadata',
        'paid_at',
    ];

    protected $casts = [
        'amount'   => 'decimal:2',
        'metadata' => 'array',
        'paid_at'  => 'datetime',
    ];

    protected $hidden = [
        'stripe_client_secret', // exposed only on creation
    ];

    //Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ─────────────────────── Helpers ───────────────────────

    public static function generateReference(): string
    {
        do {
            $ref = 'TTH-' . strtoupper(Str::random(10));
        } while (self::where('reference', $ref)->exists());

        return $ref;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function markCompleted(?string $transactionId = null): void
    {
        $this->update([
            'status'  => 'completed',
            'paid_at' => now(),
            ...(filled($transactionId) ? ['mpesa_transaction_code' => $transactionId] : []),
        ]);
    }

    public function markFailed(?string $reason = null): void
    {
        $this->update([
            'status'         => 'failed',
            'failure_reason' => $reason,
        ]);
    }

    // ─────────────────────── Accessors ───────────────────────

    public function getPayerDisplayNameAttribute(): string
    {
        if ($this->user) {
            return $this->user->name;
        }
        return $this->payer_name ?? 'Anonymous';
    }
}
