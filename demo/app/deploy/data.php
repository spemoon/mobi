<?php
    sleep(rand(0, 3));
    $arr = Array(
        "text" => rand(0, 100)
    );
    echo json_encode($arr);