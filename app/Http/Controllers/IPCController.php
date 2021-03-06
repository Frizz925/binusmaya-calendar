<?php

namespace App\Http\Controllers;

use Uuid;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\IPC\NodeIPC;

class IPCController extends Controller {
    protected $subscribed;
    protected $socketPath;
    protected $ipc;

    public function __construct() {
        $this->subscribed = [];
        $this->socketPath = config('ipc.socket_path');
        $this->ipc = new NodeIPC;
    }

    protected function ipcConnect($path=null) {
        if (is_null($path)) $path = $this->socketPath;
        $this->ipc->connect($path);
        return $this;
    }

    protected function ipcEmit($type, $data, $path=null) {
        $this->ipcConnect($path);
        return $this->ipc->emit($type, $data)->receive($type);
    }
}
