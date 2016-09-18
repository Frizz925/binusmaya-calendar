<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\IPC\NodeIPC;

class APIController extends IPCController {
    public function authLogin(Request $request) {
        $result = $this->ipcEmit("api/auth/login", $request->all());
        return response()->json($result, $result->status);
    }
}
