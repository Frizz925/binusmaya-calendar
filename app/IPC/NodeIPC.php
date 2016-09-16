<?php

namespace App\IPC;

class NodeIPC {
    protected $socket;

    private $received;
    private $connected;
    private $path;

    public function __construct() {
        $this->connected = false;
        $this->received = [];
    }

    public function connect($path) {
        if (!$this->connected) {
            $proto = getprotobyname('unix');
            $this->socket = socket_create(AF_UNIX, SOCK_STREAM, $proto);
            $this->path = $path;
            socket_connect($this->socket, $path);
            $this->connected = true;
        } else if ($this->path != $path) {
            $this->disconnect()->connect($path);
        }
        return $this;
    }

    public function emit($type, $data) {
        return $this->send([
            "type" => $type,
            "data" => $data
        ]);
    }

    public function send($json) {
        return $this->sendRaw(json_encode($json)."\f");
    }

    public function sendRaw($str) {
        socket_send($this->socket, $str, strlen($str), MSG_EOF);
        return $this;
    }

    public function receive($type) {
        $data = $this->fetchData($type);
        if (isset($data)) return $data;
        while (true) {
            $str = $this->receiveRaw();
            $json = json_decode($str);
            if ($json->type != $type) {
                $this->storeData($type, $json->data);
            } else {
                return $json->data;
            }
        }
    }

    public function receiveRaw() {
        $str = "";
        while (true) {
            $count = socket_recv($this->socket, $buf, 1, MSG_WAITALL);
            if ($buf == "\f") break;
            $str .= $buf;
        }
        return $str;
    }

    public function disconnect() {
        if ($this->connected) {
            socket_close($this->socket);
            $this->socket = null;
            $this->connected = false;
        }
        return $this;
    }

    public function isConnected() {
        return $this->connected;
    }

    protected function storeData($type, $data) {
        if (!array_key_exists($type, $this->received)) {
            $this->received[$type] = [];
        }
        array_push($this->received[$type], $data);
        return $this;
    }

    protected function fetchData($type) {
        if (array_key_exists($type, $this->received)) {
            return array_shift($this->received[$type]);
        } else {
            return null;
        }
    }
}
