<?php

// Creating our own JSON REST API
add_action("rest_api_init", "universityRegisterSearch");

// Register route with HTTP method
function universityRegisterSearch() {
    register_rest_route("university/v1", "search", array(
        "methods" => WP_REST_SERVER::READABLE, // Methor get etc...
        "callback" => "universitySearchResults"
    ));
}

// What data we need to output in the JSON request
function universitySearchResults($data) {
    $mainQuery = new WP_Query(array(
        "post_type" => array("post", "page", "professor", "program", "campus", "event"),
        "s" => sanitize_text_field($data["query"])
    ));

    $results = array(
        "generalInfo" => array(),
        "professors" => array(),
        "programs" => array(),
        "events" => array(),
        "campuses" => array(),
        
    );

    while($mainQuery->have_posts()) {
        $mainQuery->the_post();

        if (get_post_type() == "post" || get_post_type() == "page") {
            array_push($results["generalInfo"], array(
                "title" => get_the_title(),
                "permalink" => get_the_permalink()
            ));
        }

        if (get_post_type() == "professor") {
            array_push($results["professors"], array(
                "title" => get_the_title(),
                "permalink" => get_the_permalink()
            ));
        }

        if (get_post_type() == "program") {
            array_push($results["programs"], array(
                "title" => get_the_title(),
                "permalink" => get_the_permalink()
            ));
        }

        if (get_post_type() == "event") {
            array_push($results["events"], array(
                "title" => get_the_title(),
                "permalink" => get_the_permalink()
            ));
        }

        if (get_post_type() == "campus") {
            array_push($results["campuses"], array(
                "title" => get_the_title(),
                "permalink" => get_the_permalink()
            ));
        }
        
    }

    return $results;
}