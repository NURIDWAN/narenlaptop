<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private const KEYS = [
        'site_name', 'site_logo', 'favicon', 'logo_display_mode', 'primary_color', 'navbar_color',
        'section_bg_light', 'section_bg_dark', 'section_text_light', 'section_text_dark', 'section_accent_color',
        'whatsapp_number', 'whatsapp_message_default', 'email', 'address', 'google_maps_embed',
        'social_instagram', 'social_facebook', 'social_tiktok', 'social_youtube', 'social_shopee',
        'ga_tracking_id', 'gtm_id', 'header_scripts', 'footer_scripts',
        'google_site_verification', 'robots_txt', 'business_hours',
        'ai_base_url', 'ai_api_key', 'ai_model',
        'ai_article_word_count', 'ai_article_tone', 'ai_article_audience', 'ai_article_brand_context',
        'ai_article_cta', 'ai_article_internal_links', 'ai_article_prompt_notes',
    ];

    public function index(): Response
    {
        $settings = Setting::publicValues();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string', 'max:5000'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            if (! in_array($key, self::KEYS)) {
                continue;
            }
            Setting::updateOrCreate(['key' => $key], ['value' => $value ?? '']);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function verifyAi(Request $request): \Illuminate\Http\JsonResponse
    {
        $baseUrl = rtrim(trim($request->input('base_url', '')), '/');
        $apiKey = trim($request->input('api_key', ''));
        $model = trim($request->input('model', ''));

        if (! $baseUrl || ! $apiKey || ! $model) {
            return response()->json(['ok' => false, 'message' => 'Semua field (Base URL, API Key, Model) harus diisi.']);
        }

        $endpoint = "{$baseUrl}/chat/completions";

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($endpoint, [
                'model' => $model,
                'max_tokens' => 10,
                'messages' => [['role' => 'user', 'content' => 'Hi']],
            ]);

            if ($response->successful()) {
                $body = $response->json();
                if (! empty($body['choices'][0]['message']['content']) || ! empty($body['choices'])) {
                    return response()->json(['ok' => true, 'message' => 'Koneksi berhasil! Model merespons dengan baik.']);
                }

                return response()->json(['ok' => false, 'message' => 'Response berhasil tapi format tidak dikenali. Periksa model yang digunakan.']);
            }

            $errorMsg = $response->json('error.message')
                ?? $response->json('message')
                ?? $response->json('error')
                ?? 'HTTP '.$response->status();

            if (is_array($errorMsg)) {
                $errorMsg = json_encode($errorMsg);
            }

            return response()->json(['ok' => false, 'message' => 'Gagal ('.$response->status().'): '.$errorMsg]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json(['ok' => false, 'message' => 'Tidak dapat terhubung ke server. Periksa Base URL dan koneksi internet. Detail: '.$e->getMessage()]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => 'Error: '.$e->getMessage()]);
        }
    }
}
