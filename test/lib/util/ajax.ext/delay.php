<?php
    sleep(3);
    $arr = Array(
        "code" => 200,
        "data" => "hello"
    );
    echo json_encode($arr);