<?php

namespace App\Http\Controllers;

use Log;
use Uuid;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

use App\Http\Requests;

class IndexController extends Controller
{
    public function index() {
        $uuid = Uuid::generate()->string;
        $message = [
            "uuid" => $uuid, 
            "path" => "index",
            "data" => [
                "name" => "Shiki"
            ]
        ];
        Redis::publish("node-renderer-req-$uuid", json_encode($message));
        Redis::subscribe(["node-renderer-res-$uuid"], function($message) {
            die($message);
        });
    }
}
