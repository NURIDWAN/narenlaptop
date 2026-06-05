<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminSettingAiVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_verify_gemini_connection(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'Hi']],
                ],
            ]),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->postJson(route('admin.settings.verify-ai'), [
            'base_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            'api_key' => 'gemini-key',
            'model' => 'gemini-2.5-flash',
        ])->assertOk()->assertJson([
            'ok' => true,
            'message' => 'Koneksi berhasil! Model merespons dengan baik.',
        ]);

        Http::assertSent(function (Request $request) {
            return $request->url() === 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
                && $request->hasHeader('Authorization', 'Bearer gemini-key')
                && $request['model'] === 'gemini-2.5-flash'
                && $request['max_tokens'] === 10
                && $request['messages'][0]['content'] === 'Hi';
        });
    }

    public function test_verify_gemini_connection_requires_all_fields(): void
    {
        Http::fake();

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->postJson(route('admin.settings.verify-ai'), [
            'base_url' => '',
            'api_key' => '',
            'model' => '',
        ])->assertOk()->assertJson([
            'ok' => false,
            'message' => 'Semua field (Base URL, API Key, Model) harus diisi.',
        ]);

        Http::assertNothingSent();
    }

    public function test_verify_gemini_connection_returns_api_error_message(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' => Http::response([
                'error' => ['message' => 'API key tidak valid'],
            ], 400),
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->postJson(route('admin.settings.verify-ai'), [
            'base_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            'api_key' => 'bad-key',
            'model' => 'gemini-2.5-flash',
        ])->assertOk()->assertJson([
            'ok' => false,
            'message' => 'Gagal (400): API key tidak valid',
        ]);
    }
}
