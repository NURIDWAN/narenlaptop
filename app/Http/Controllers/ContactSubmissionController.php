<?php

namespace App\Http\Controllers;

use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactSubmissionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        ContactSubmission::create($request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:180'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['required', 'string', 'max:2000'],
        ]));

        return back()->with('success', 'Pesan berhasil dikirim.');
    }
}
