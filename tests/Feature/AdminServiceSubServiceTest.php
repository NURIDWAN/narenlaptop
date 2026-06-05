<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\ServiceSubService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminServiceSubServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_service_with_sub_services(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->post(route('admin.services.store'), [
            'title' => 'Service Laptop',
            'description' => '<p>Perbaikan laptop.</p>',
            'image' => '/storage/media/service.jpg',
            'cta_text' => 'Booking',
            'cta_url' => '/kontak',
            'order' => 1,
            'is_active' => true,
            'sub_services' => [
                [
                    'name' => 'Ganti LCD',
                    'description' => '<p>Penggantian panel LCD laptop.</p>',
                    'image' => '/storage/media/lcd.jpg',
                    'order' => 1,
                    'is_active' => true,
                ],
            ],
        ])->assertRedirect();

        $service = Service::query()->where('title', 'Service Laptop')->firstOrFail();

        $this->assertDatabaseHas('service_sub_services', [
            'service_id' => $service->id,
            'name' => 'Ganti LCD',
            'description' => '<p>Penggantian panel LCD laptop.</p>',
            'image' => '/storage/media/lcd.jpg',
            'order' => 1,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_and_remove_sub_services(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $service = Service::create(['title' => 'Service Laptop']);
        $kept = ServiceSubService::create([
            'service_id' => $service->id,
            'name' => 'Ganti LCD',
            'order' => 1,
            'is_active' => true,
        ]);
        $removed = ServiceSubService::create([
            'service_id' => $service->id,
            'name' => 'Cleaning',
            'order' => 2,
            'is_active' => true,
        ]);

        $this->actingAs($user)->put(route('admin.services.update', $service), [
            'title' => 'Service Laptop Premium',
            'description' => null,
            'icon' => null,
            'image' => null,
            'cta_text' => null,
            'cta_url' => null,
            'order' => 3,
            'is_active' => true,
            'sub_services' => [
                [
                    'id' => $kept->id,
                    'name' => 'Ganti LCD Touchscreen',
                    'description' => '<p>Penggantian LCD touchscreen.</p>',
                    'image' => '/storage/media/touchscreen.jpg',
                    'order' => 1,
                    'is_active' => false,
                ],
                [
                    'name' => 'Upgrade SSD',
                    'description' => '<p>Upgrade storage ke SSD.</p>',
                    'image' => null,
                    'order' => 2,
                    'is_active' => true,
                ],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('service_sub_services', [
            'id' => $kept->id,
            'name' => 'Ganti LCD Touchscreen',
            'description' => '<p>Penggantian LCD touchscreen.</p>',
            'image' => '/storage/media/touchscreen.jpg',
            'is_active' => false,
        ]);
        $this->assertDatabaseHas('service_sub_services', [
            'service_id' => $service->id,
            'name' => 'Upgrade SSD',
            'description' => '<p>Upgrade storage ke SSD.</p>',
            'is_active' => true,
        ]);
        $this->assertDatabaseMissing('service_sub_services', ['id' => $removed->id]);
    }

    public function test_sub_services_are_deleted_with_parent_service(): void
    {
        $service = Service::create(['title' => 'Service Laptop']);
        $subService = ServiceSubService::create([
            'service_id' => $service->id,
            'name' => 'Ganti LCD',
        ]);

        $service->delete();

        $this->assertDatabaseMissing('service_sub_services', ['id' => $subService->id]);
    }
}
