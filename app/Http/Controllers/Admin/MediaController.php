<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $media = Media::query()
            ->when($request->search, fn ($q, $s) => $q->where('filename', 'like', "%{$s}%"))
            ->latest()
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Admin/Media/Index', [
            'media' => $media,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'max:10'],
            'files.*' => ['file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:5120'],
        ]);

        foreach ($request->file('files') as $file) {
            $path = $file->store('media', 'public');

            Media::create([
                'filename' => $file->getClientOriginalName(),
                'path' => $path,
                'disk' => 'public',
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);
        }

        return back()->with('success', count($request->file('files')).' file berhasil diupload.');
    }

    /** JSON response for inline uploads (section builder, editor). */
    public function upload(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:5120']]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $media = Media::create([
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json(['url' => $media->url]);
    }

    /** JSON response for media picker in admin forms. */
    public function picker(Request $request): JsonResponse
    {
        $items = Media::query()
            ->where('mime_type', 'like', 'image/%')
            ->when($request->search, fn ($q, $s) => $q->where('filename', 'like', "%{$s}%"))
            ->latest()
            ->take(48)
            ->get(['id', 'filename', 'path', 'disk', 'alt']);

        return response()->json([
            'items' => $items->map(fn (Media $media) => [
                'id' => $media->id,
                'filename' => $media->filename,
                'url' => $media->url,
                'alt' => $media->alt,
            ])->all(),
        ]);
    }

    public function update(Request $request, Media $medium): RedirectResponse
    {
        $medium->update($request->validate(['alt' => ['nullable', 'string', 'max:255']]));

        return back()->with('success', 'Alt text diperbarui.');
    }

    public function destroy(Media $medium): RedirectResponse
    {
        $medium->delete();

        return back()->with('success', 'File dihapus.');
    }
}
