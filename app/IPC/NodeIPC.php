<?php

namespace App\IPC;

class NodeIPC {
    protected $socket;

    public function connect($path) {
        $proto = getprotobyname('unix');
        $this->socket = socket_create(AF_UNIX, SOCK_STREAM, $proto);
        socket_connect($this->socket, $path);
        return $this;
    }

    public function sendRaw($str) {
        socket_send($this->socket, $str, strlen($str), MSG_EOF);
        return $this;
    }

    public function emit($type, $data) {
        $payload = [
            "type" => $type,
            "data" => $data
        ];
        $str = json_encode($payload)."\f";
        return $this->sendRaw($str);
    }

    public function listen($type, $callback, $assoc=false) {
        $data = null;
        $event = null;
        while ($event != $type) {
            $str = $this->receiveRaw();
            $json = json_decode($str, $assoc);
            $event = $assoc ? $json['type'] : $json->type;
            $data = $assoc ? $json['data'] : $json->data;
        }
        $callback($data);
        return $this;
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
        if (isset($this->socket)) {
            socket_close($this->socket);
            $this->socket = null;
        }
        return $this;
    }
}
