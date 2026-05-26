<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\SEOGeneratorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateArticleSEOJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Article $article)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(SEOGeneratorService $seoGenerator): void
    {
        $this->article->refresh();
        $this->article->update($seoGenerator->generateForArticle($this->article));
    }
}
