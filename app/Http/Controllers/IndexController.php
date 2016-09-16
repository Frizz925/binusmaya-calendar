<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class IndexController extends IPCController {
    public function index() {
        return $this->ipcEmit("page-render", [
            "page" => "index",
            "data" => [
                "name" => "Ichinose Shiki"
            ]
        ])->html;
    }
}
