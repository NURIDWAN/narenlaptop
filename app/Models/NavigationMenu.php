<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavigationMenu extends Model
{
    protected $fillable = ['location', 'label', 'url', 'order', 'parent_id', 'open_in_new_tab', 'badge'];

    protected function casts(): array
    {
        return ['open_in_new_tab' => 'boolean'];
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('order');
    }

    public static function tree(string $location): array
    {
        return static::query()
            ->where('location', $location)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get()
            ->toArray();
    }
}
