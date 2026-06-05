<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no" class="notranslate">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="google" content="notranslate">
        <meta name="format-detection" content="telephone=no">
        @php
            $__settings = \App\Models\Setting::query()->whereIn('key', ['google_site_verification', 'favicon', 'navbar_color'])->pluck('value', 'key');
            $__gsv = $__settings['google_site_verification'] ?? '';
            $__favicon = $__settings['favicon'] ?? '';
            $__themeColor = $__settings['navbar_color'] ?? '#061329';
        @endphp
        <meta name="theme-color" content="{{ $__themeColor }}">
        @if($__gsv)
        <meta name="google-site-verification" content="{{ $__gsv }}" />
        @endif

        <title inertia>{{ config('app.name', 'Naren Laptop') }}</title>
        @if($__favicon)
        <link rel="icon" href="{{ $__favicon }}">
        <link rel="shortcut icon" href="{{ $__favicon }}">
        @else
        <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
        <link rel="shortcut icon" href="{{ asset('favicon.svg') }}">
        @endif
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased notranslate" translate="no">
        @inertia
    </body>
</html>
