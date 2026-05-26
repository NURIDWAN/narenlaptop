<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        Product::query()
            ->whereNull('slug')
            ->get(['id', 'name'])
            ->each(function (Product $product) {
                $base = Str::slug($product->name) ?: 'produk';
                $slug = $base;
                $counter = 2;

                while (Product::query()->where('id', '!=', $product->id)->where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$counter}";
                    $counter++;
                }

                $product->forceFill(['slug' => $slug])->save();
            });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
