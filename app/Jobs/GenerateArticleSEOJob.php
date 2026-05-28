<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\SEOGeneratorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateArticleSEOJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public function __construct(public Article $article)
    {
    }

    public function handle(SEOGeneratorService $seoGenerator): void
    {
        $this->article->refresh();
        $plainText = trim(strip_tags($this->article->content ?? ''));

        $settings = \App\Models\Setting::query()->whereIn('key', ['ai_api_key', 'ai_base_url', 'ai_model'])->pluck('value', 'key');
        $apiKey = $settings['ai_api_key'] ?? config('services.claude.api_key');

        if (! $apiKey || strlen($plainText) < 100) {
            $this->article->update($seoGenerator->generateForArticle($this->article));
            return;
        }

        try {
            $generated = $this->generateWithAI($apiKey, $settings['ai_base_url'] ?? config('services.claude.base_url', 'https://openrouter.ai/api/v1'), $settings['ai_model'] ?? config('services.claude.model', 'anthropic/claude-sonnet-4-20250514'), $plainText);
            $this->article->update(array_filter([
                'meta_title' => $generated['meta_title'] ?? null,
                'meta_description' => $generated['meta_description'] ?? null,
                'meta_keywords' => $generated['meta_keywords'] ?? null,
                'excerpt' => $this->article->excerpt ?: ($generated['excerpt'] ?? null),
                'reading_time' => max(1, (int) ceil(str_word_count($plainText) / 200)),
            ]));
        } catch (\Throwable $e) {
            Log::warning('AI SEO generation failed, using fallback', ['error' => $e->getMessage()]);
            $this->article->update($seoGenerator->generateForArticle($this->article));
        }
    }

    private function generateWithAI(string $apiKey, string $baseUrl, string $model, string $content): array
    {
        $truncated = mb_substr($content, 0, 3000);

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
        ])->timeout(30)->post("{$baseUrl}/chat/completions", [
            'model' => $model,
            'max_tokens' => 512,
            'messages' => [[
                'role' => 'user',
                'content' => "Kamu adalah SEO specialist untuk website service laptop berbahasa Indonesia. Berdasarkan konten artikel berikut, generate JSON dengan format:\n{\"meta_title\": \"50-60 karakter, mengandung keyword utama\", \"meta_description\": \"150-160 karakter, mengandung CTA\", \"meta_keywords\": [\"5-8 keyword relevan\"], \"excerpt\": \"1-2 kalimat ringkasan\"}\n\nKonten:\n{$truncated}\n\nBalas HANYA dengan JSON valid, tanpa teks lain.",
            ]],
        ]);

        $text = $response->json('choices.0.message.content', '');
        if (preg_match('/\{[\s\S]*\}/', $text, $m)) {
            $data = json_decode($m[0], true);
            if (is_array($data)) {
                return $data;
            }
        }

        throw new \RuntimeException('Invalid OpenRouter response');
    }
}
