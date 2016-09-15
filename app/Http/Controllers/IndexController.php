<?php

namespace App\Http\Controllers;

use Log;
use Uuid;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\IPC\NodeIPC;

class IndexController extends Controller {
    protected $sockPath;

    public function __construct() {
        $this->sockPath = app_path()."/Web/node.sock";
    }

    public function index() {
        $uuid = Uuid::generate()->string;
        $data = [
            "uuid" => $uuid, 
            "path" => "index",
            "data" => [
                "name" => "Ichinose Shiki"
            ]
        ];

        $html = "";
        (new NodeIPC)->connect($this->sockPath)
            ->emit("page-render", $data)
            ->listen("page-render", function($data) use (&$html) {
                $html = $data;
            })
            ->disconnect();

        return $html;
    }
}
