<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('navigation_menus', function (Blueprint $table) {
            $table->id();
            $table->string('location'); // header, footer
            $table->string('label');
            $table->string('url');
            $table->unsignedInteger('order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('navigation_menus')->cascadeOnDelete();
            $table->boolean('open_in_new_tab')->default(false);
            $table->string('badge')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('navigation_menus');
    }
};
