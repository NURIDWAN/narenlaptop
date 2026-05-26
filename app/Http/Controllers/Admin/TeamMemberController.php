<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function index(Request $request): Response
    {
        $members = TeamMember::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('role', 'like', "%{$s}%"))
            ->when($request->has('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->when($request->sort, function ($q) use ($request) {
                $q->orderBy($request->sort, $request->direction === 'asc' ? 'asc' : 'desc');
            }, fn ($q) => $q->orderBy('order'))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Team/Index', [
            'members' => $members,
            'filters' => $request->only('search', 'active', 'sort', 'direction'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        TeamMember::create($this->validated($request));

        return back()->with('success', 'Anggota tim ditambahkan.');
    }

    public function update(Request $request, TeamMember $team_member): RedirectResponse
    {
        $team_member->update($this->validated($request));

        return back()->with('success', 'Anggota tim diperbarui.');
    }

    public function destroy(TeamMember $team_member): RedirectResponse
    {
        $team_member->delete();

        return back()->with('success', 'Anggota tim dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'role' => ['nullable', 'string', 'max:100'],
            'photo' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'order' => ['integer'],
        ]);
    }
}
