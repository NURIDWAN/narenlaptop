<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Str;

class SEOGeneratorService
{
    public function generateForArticle(Article $article): array
    {
        $plainText = trim(preg_replace('/\s+/', ' ', strip_tags($article->content ?? '')));
        $words = str_word_count($plainText);
        $readingTime = max(1, (int) ceil($words / 200));
        $excerpt = $article->excerpt ?: Str::limit($plainText, 165);
        $baseTitle = Str::limit($article->title, 58, '');

        $keywords = collect(explode(' ', Str::lower($plainText)))
            ->map(fn ($word) => trim($word, ".,!?;:()[]{}\"'"))
            ->filter(fn ($word) => strlen($word) > 4)
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(8)
            ->values()
            ->all();

        return [
            'meta_title' => $article->meta_title ?: $baseTitle,
            'meta_description' => $article->meta_description ?: Str::limit($excerpt, 155),
            'meta_keywords' => $article->meta_keywords ?: $keywords,
            'excerpt' => $excerpt,
            'reading_time' => $readingTime,
            'schema_type' => $article->schema_type ?: 'Article',
        ];
    }

    public function scoreArticle(Article $article): array
    {
        $content = $article->content ?? '';
        $mainKeyword = Str::lower(trim((string) collect($article->meta_keywords ?? [])->first()));
        $titleOrH1Text = Str::lower(trim(strip_tags(($article->title ?? '').' '.$content)));
        $keywordInHeading = $mainKeyword === '' || str_contains($titleOrH1Text, $mainKeyword);
        $readability = $this->readabilityScore($content);

        $checks = [
            'Panjang judul SEO 50-60 karakter' => strlen($article->meta_title ?? '') >= 50 && strlen($article->meta_title ?? '') <= 60,
            'Meta description tersedia' => filled($article->meta_description),
            'Keyword utama muncul di judul/H1' => $keywordInHeading,
            'Internal link minimal 1' => str_contains($content, 'href="/') || str_contains($content, url('/')),
            'Alt text pada gambar' => ! str_contains($content, '<img') || preg_match_all('/<img[^>]+alt=["\'][^"\']+["\']/i', $content) > 0,
            'Readability score baik (≥60)' => $readability >= 60,
        ];

        $passed = count(array_filter($checks));

        return [
            'score' => (int) round(($passed / count($checks)) * 100),
            'checks' => $checks,
            'readability' => $readability,
        ];
    }

    /**
     * Simplified Flesch Reading Ease adapted for Indonesian text.
     * Returns 0-100 (higher = easier to read).
     */
    public function readabilityScore(string $html): int
    {
        $text = trim(preg_replace('/\s+/', ' ', strip_tags($html)));
        if ($text === '') {
            return 0;
        }

        $sentences = max(1, preg_match_all('/[.!?]+/', $text));
        $words = max(1, str_word_count($text));
        $syllables = $this->countSyllables($text);

        // Flesch Reading Ease formula
        $score = 206.835 - (1.015 * ($words / $sentences)) - (84.6 * ($syllables / $words));

        return (int) max(0, min(100, round($score)));
    }

    private function countSyllables(string $text): int
    {
        // Simple Indonesian syllable estimation: count vowel groups
        $words = preg_split('/\s+/', Str::lower($text));
        $total = 0;
        foreach ($words as $word) {
            $count = preg_match_all('/[aiueo]+/i', $word);
            $total += max(1, $count);
        }

        return $total;
    }

    public function schemaForArticle(Article $article): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => $article->schema_type ?: 'Article',
            'headline' => $article->meta_title ?: $article->title,
            'description' => $article->meta_description ?: $article->excerpt,
            'datePublished' => optional($article->published_at ?? $article->created_at)->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $article->author?->name ?? config('app.name'),
            ],
        ];
    }
}
