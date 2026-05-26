<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'status',
        'meta_title',
        'meta_description',
        'meta_og_image',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)->orderBy('order');
    }

    public function visibleSections(): HasMany
    {
        return $this->sections()->where('is_visible', true);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
