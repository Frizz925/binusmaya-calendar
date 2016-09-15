<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/

Route::get('/', function () {
    $path = app_path()."/Web/index.js";
    $json = json_encode([
        "name" => "Izra"
    ]);
    $output;
    $start = microtime();
    exec("node $path '$json'", $output);
    $html = implode("\n", $output);
    return $html;
});
