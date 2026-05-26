<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $messages = ContactSubmission::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")->orWhere('message', 'like', "%{$s}%"))
            ->when($request->status === 'unread', fn ($q) => $q->whereNull('read_at'))
            ->when($request->status === 'read', fn ($q) => $q->whereNotNull('read_at'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Messages/Index', [
            'messages' => $messages,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function show(ContactSubmission $message): Response
    {
        if (! $message->read_at) {
            $message->update(['read_at' => now()]);
        }

        return Inertia::render('Admin/Messages/Show', ['message' => $message]);
    }

    public function destroy(ContactSubmission $message): RedirectResponse
    {
        $message->delete();

        return to_route('admin.messages.index')->with('success', 'Pesan dihapus.');
    }
}
