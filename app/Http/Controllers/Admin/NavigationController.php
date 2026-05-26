<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NavigationMenu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NavigationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Navigation/Index', [
            'headerMenus' => NavigationMenu::tree('header'),
            'footerMenus' => NavigationMenu::tree('footer'),
            'pages' => \App\Models\Page::query()->published()->get(['id', 'title', 'slug']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'location' => ['required', 'in:header,footer'],
            'label' => ['required', 'string', 'max:100'],
            'url' => ['nullable', 'string', 'max:500'],
            'parent_id' => ['nullable', 'integer', 'exists:navigation_menus,id'],
            'open_in_new_tab' => ['boolean'],
            'badge' => ['nullable', 'string', 'max:30'],
            'children' => ['nullable', 'array'],
            'children.*.label' => ['required', 'string', 'max:100'],
            'children.*.url' => ['required', 'string', 'max:500'],
        ]);

        $children = $data['children'] ?? [];
        unset($data['children']);

        $data['url'] = $data['url'] ?: '#';
        $data['order'] = NavigationMenu::where('location', $data['location'])
            ->where('parent_id', $data['parent_id'] ?? null)
            ->max('order') + 1;

        $menu = NavigationMenu::create($data);

        foreach ($children as $i => $child) {
            NavigationMenu::create([
                'location' => $data['location'],
                'label' => $child['label'],
                'url' => $child['url'],
                'parent_id' => $menu->id,
                'order' => $i,
            ]);
        }

        return back()->with('success', 'Menu ditambahkan.');
    }

    public function update(Request $request, NavigationMenu $navigation): RedirectResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:500'],
            'open_in_new_tab' => ['boolean'],
            'badge' => ['nullable', 'string', 'max:30'],
            'children' => ['nullable', 'array'],
            'children.*.id' => ['nullable', 'integer', 'exists:navigation_menus,id'],
            'children.*.label' => ['required', 'string', 'max:100'],
            'children.*.url' => ['required', 'string', 'max:500'],
        ]);

        $children = $data['children'] ?? [];
        unset($data['children']);

        $navigation->update($data);

        if ($data['url'] !== '#') {
            $navigation->children()->delete();

            return back()->with('success', 'Menu diperbarui.');
        }

        $keptChildIds = collect($children)
            ->pluck('id')
            ->filter()
            ->all();

        if (empty($keptChildIds)) {
            $navigation->children()->delete();
        } else {
            $navigation->children()->whereNotIn('id', $keptChildIds)->delete();
        }

        foreach ($children as $order => $child) {
            if (! empty($child['id'])) {
                $navigation->children()->where('id', $child['id'])->update([
                    'label' => $child['label'],
                    'url' => $child['url'],
                    'order' => $order,
                    'open_in_new_tab' => false,
                    'badge' => null,
                ]);

                continue;
            }

            NavigationMenu::create([
                'location' => $navigation->location,
                'label' => $child['label'],
                'url' => $child['url'],
                'parent_id' => $navigation->id,
                'order' => $order,
            ]);
        }

        return back()->with('success', 'Menu diperbarui.');
    }

    public function destroy(NavigationMenu $navigation): RedirectResponse
    {
        $navigation->delete();

        return back()->with('success', 'Menu dihapus.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate(['items' => ['required', 'array'], 'items.*' => ['integer']]);

        foreach ($data['items'] as $order => $id) {
            NavigationMenu::where('id', $id)->update(['order' => $order]);
        }

        return back()->with('success', 'Urutan diperbarui.');
    }
}
