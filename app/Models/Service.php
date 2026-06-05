<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'title',
        'description',
        'icon',
        'image',
        'cta_text',
        'cta_url',
        'order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order')->orderBy('title');
    }

    public function subServices(): HasMany
    {
        return $this->hasMany(ServiceSubService::class)->orderBy('order')->orderBy('name');
    }

    public function activeSubServices(): HasMany
    {
        return $this->subServices()->where('is_active', true);
    }
}
