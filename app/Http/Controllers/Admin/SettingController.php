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
        'site_name', 'site_logo', 'favicon', 'primary_color',
        'whatsapp_number', 'whatsapp_message_default', 'email', 'address', 'google_maps_embed',
        'social_instagram', 'social_facebook', 'social_tiktok', 'social_youtube',
        'ga_tracking_id', 'gtm_id', 'header_scripts', 'footer_scripts',
        'google_site_verification', 'robots_txt', 'business_hours',
        'ai_base_url', 'ai_api_key', 'ai_model',
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
        $baseUrl = trim($request->input('base_url', ''));
        $apiKey = trim($request->input('api_key', ''));
        $model = trim($request->input('model', ''));

        if (! $baseUrl || ! $apiKey || ! $model) {
            return response()->json(['ok' => false, 'message' => 'Semua field harus diisi.']);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
            ])->timeout(15)->post("{$baseUrl}/chat/completions", [
                'model' => $model,
                'max_tokens' => 10,
                'messages' => [['role' => 'user', 'content' => 'Hi']],
            ]);

            if ($response->successful() && $response->json('choices.0.message.content')) {
                return response()->json(['ok' => true, 'message' => 'Koneksi berhasil!']);
            }

            return response()->json(['ok' => false, 'message' => 'Gagal: '.$response->json('error.message', 'Response tidak valid.')]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => 'Error: '.$e->getMessage()]);
        }
    }
}
