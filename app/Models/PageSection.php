<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageSection extends Model
{
    protected $fillable = [
        'page_id',
        'type',
        'order',
        'settings',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_visible' => 'boolean',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }
}
