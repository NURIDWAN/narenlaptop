<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => $this->getStats(),
            'messageTrend' => $this->getMessageTrend(),
            'recentPages' => Page::query()->latest('updated_at')->take(5)->get(['id', 'title', 'slug', 'status', 'updated_at']),
            'recentArticles' => Article::query()->latest('updated_at')->take(5)->get(['id', 'title', 'slug', 'status', 'updated_at']),
            'recentMessages' => ContactSubmission::query()->latest()->take(3)->get(['id', 'name', 'message', 'created_at', 'read_at']),
            'unreadMessages' => ContactSubmission::query()->whereNull('read_at')->count(),
        ]);
    }

    private function getStats(): array
    {
        return [
            'pages' => Page::query()->count(),
            'publishedPages' => Page::query()->published()->count(),
            'articles' => Article::query()->count(),
            'publishedArticles' => Article::query()->published()->count(),
            'products' => Product::query()->count(),
            'services' => Service::query()->count(),
            'messages' => ContactSubmission::query()->count(),
            'users' => User::query()->count(),
        ];
    }

    private function getMessageTrend(): array
    {
        $startDate = Carbon::today()->subDays(6);

        $submissions = ContactSubmission::query()
            ->where('created_at', '>=', $startDate->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->pluck('count', 'date')
            ->toArray();

        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $trend[] = [
                'date' => $date,
                'count' => $submissions[$date] ?? 0,
            ];
        }

        return $trend;
    }
}
