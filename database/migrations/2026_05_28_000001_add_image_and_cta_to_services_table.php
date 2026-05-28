<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('image')->nullable()->after('icon');
            $table->string('cta_text', 80)->nullable()->after('image');
            $table->string('cta_url')->nullable()->after('cta_text');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['image', 'cta_text', 'cta_url']);
        });
    }
};
