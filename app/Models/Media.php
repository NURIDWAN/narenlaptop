<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use SoftDeletes;

    protected $fillable = ['filename', 'path', 'disk', 'mime_type', 'size', 'alt', 'uploaded_by'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
