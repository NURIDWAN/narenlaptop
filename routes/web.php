<?php

use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Admin\ArticleCategoryController as AdminArticleCategoryController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Admin\SliderController as AdminSliderController;
use App\Http\Controllers\ContactSubmissionController;
use App\Http\Controllers\Frontend\ArticleController;
use App\Http\Controllers\Frontend\PageController;
use App\Http\Controllers\Frontend\ProductController;
use App\Http\Controllers\ProfileController;
use App\Models\Article;
use App\Models\ContactSubmission;
use App\Models\Page;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PageController::class, 'home'])->name('home');

Route::get('/blog', [ArticleController::class, 'index'])->name('blog.index');
Route::get('/blog/kategori/{slug}', [ArticleController::class, 'category'])->name('blog.category');
Route::get('/blog/{slug}', [ArticleController::class, 'show'])->name('blog.show');
Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::post('/kontak', [ContactSubmissionController::class, 'store'])->middleware('throttle:10,1')->name('contact.store');

Route::get('/sitemap.xml', function () {
    $urls = collect()
        ->merge(Page::query()->published()->get()->map(fn (Page $page) => url($page->slug === 'beranda' ? '/' : '/'.$page->slug)))
        ->merge(Article::query()->published()->get()->map(fn (Article $article) => route('blog.show', $article->slug)))
        ->push(route('products.index'))
        ->merge(Product::query()->active()->whereNotNull('slug')->get()->map(fn (Product $product) => route('products.show', $product->slug)));

    $xml = view('sitemap', ['urls' => $urls])->render();

    return new HttpResponse($xml, 200, ['Content-Type' => 'application/xml']);
})->name('sitemap');

Route::get('/robots.txt', function () {
    $robots = Setting::query()->where('key', 'robots_txt')->value('value');

    return response($robots['content'] ?? "User-agent: *\nAllow: /\nSitemap: ".url('/sitemap.xml')."\n", 200)
        ->header('Content-Type', 'text/plain');
})->name('robots');

Route::get('/dashboard', fn () => Inertia::render('Dashboard', [
    'stats' => [
        'pages' => Page::query()->count(),
        'publishedPages' => Page::query()->published()->count(),
        'articles' => Article::query()->count(),
        'publishedArticles' => Article::query()->published()->count(),
        'messages' => ContactSubmission::query()->count(),
    ],
    'recentPages' => Page::query()->latest()->take(5)->get(['id', 'title', 'slug', 'status', 'updated_at']),
    'recentArticles' => Article::query()->latest()->take(5)->get(['id', 'title', 'slug', 'status', 'updated_at']),
]))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('pages', AdminPageController::class);
        Route::resource('articles', AdminArticleController::class);
        Route::resource('article-categories', AdminArticleCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('services', AdminServiceController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('products', AdminProductController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('sliders', AdminSliderController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('media', \App\Http\Controllers\Admin\MediaController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('media/upload', [\App\Http\Controllers\Admin\MediaController::class, 'upload'])->name('media.upload');
        Route::get('media/picker', [\App\Http\Controllers\Admin\MediaController::class, 'picker'])->name('media.picker');
        Route::get('settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');
        Route::resource('messages', \App\Http\Controllers\Admin\ContactSubmissionController::class)->only(['index', 'show', 'destroy']);
        Route::resource('navigation', \App\Http\Controllers\Admin\NavigationController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('navigation/reorder', [\App\Http\Controllers\Admin\NavigationController::class, 'reorder'])->name('navigation.reorder');
        Route::resource('testimonials', \App\Http\Controllers\Admin\TestimonialController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('team', \App\Http\Controllers\Admin\TeamMemberController::class)->only(['index', 'store', 'update', 'destroy']);
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/{slug}', [PageController::class, 'show'])->where('slug', '^(?!admin|login|register|forgot-password|reset-password|confirm-password|verify-email|email|logout|password|profile|dashboard|blog|sitemap\.xml|robots\.txt).+')->name('pages.show');
