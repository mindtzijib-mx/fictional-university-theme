<?php

require get_theme_file_path("/inc/search-route.php");

// Function to add the author name field in the rest api for posts
function university_custom_rest() {
    register_rest_field( "post", "authorName", array(
        "get_callback" => function() {return get_the_author();}
    ));

    register_rest_field( "note", "userNoteCount", array(
        "get_callback" => function() {return count_user_posts(get_current_user_id(), "note");}
    ));
}

add_action("rest_api_init", "university_custom_rest");

function page_banner($args = NULL) {
    if (!isset($args["title"])) {
        $args["title"] = get_the_title();
    }

    if (!isset($args["subtitle"])) {
        $args["subtitle"] = get_field("page_banner_subtitle");
    }

    if (!isset($args["photo"])) {
        if (get_field("page_banner_backgroung_image")) {
            $args["photo"] = get_field("page_banner_backgroung_image")["sizes"]["pageBanner"];
        } else {
            $args["photo"] = get_theme_file_uri("/images/ocean.jpg");
        }
    }
    ?>

    <div class="page-banner">
        <div class="page-banner__bg-image" style="background-image: url(<?php echo $args["photo"]; ?>; )"></div>
        <div class="page-banner__content container container--narrow">
            <h1 class="page-banner__title"><?php echo $args["title"]; ?></h1>
            <div class="page-banner__intro">
            <p><?php echo $args["subtitle"]; ?></p>
            </div>
        </div>
    </div>
    
<?php }

function university_files() {
    wp_enqueue_script("googleMap", "//maps.googleapis.com/maps/api/js?key=AIzaSyAxCWhbT1Hj3KLSWQdiNWTqGvDd6avJhok", NULL, 1, true);
    wp_enqueue_script( "main-university-js", get_theme_file_uri( "/build/index.js" ), array("jquery"), "1.0", TRUE );
    wp_enqueue_style("custom-google-fonts", "//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i");
    wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    wp_enqueue_style('university_main_styles', get_theme_file_uri("/build/index.css"));
    wp_enqueue_style('university_extra_styles', get_theme_file_uri("/build/style-index.css"));
    // creating data for the script
    wp_localize_script("main-university-js", "universityData", array(
        "root_url" => get_site_url(),
        "nonce" => wp_create_nonce("wp_rest"),
    ));
}

add_action("wp_enqueue_scripts", "university_files");

function university_features() {
    add_theme_support("title-tag");
    add_theme_support("post-thumbnails");
    register_nav_menu("exploreFooterMenu", "Explore Footer Menu");
    register_nav_menu("learnFooterMenu", "Learn Footer Menu");
    add_image_size("professorLandscape", 400, 260, true);
    add_image_size("professorPortrait", 480, 650, true);
    add_image_size("pageBanner", 1500, 350, true);
}

add_action("after_setup_theme", "university_features");

function university_adjust_queries($query) {
    if (!is_admin() && is_post_type_archive("campus") && $query->is_main_query()) {
        $query->set("posts_per_page", -1);
    }

    if (!is_admin() && is_post_type_archive("program") && $query->is_main_query()) {
        $query->set("orderby", "title");
        $query->set("order", "ASC");
        $query->set("posts_per_page", -1);
    }

    if (!is_admin() && is_post_type_archive("event") && $query->is_main_query()) {
        $today = date("Ymd");
        $query->set("meta_key", "event_date");
        $query->set("orderby", "meta_value_num");
        $query->set("order", "ASC");
        $query->set("meta_query", array(
            array(
                "key" => "event_date",
                "compare" => ">=",
                "value" => $today,
                "type" => "numeric"
            )
        ));
    }
}

add_action("pre_get_posts", "university_adjust_queries");

function universityMapKey($api) {
    $api["key"] = "AIzaSyAxCWhbT1Hj3KLSWQdiNWTqGvDd6avJhok";
    return $api;
}

add_filter("acf/fields/google_map/api", "universityMapKey");

// Redirect subscribers to the front end
add_action("admin_init", "redirectSubsToFrontend");

function redirectSubsToFrontend() {
    $ourCurrentUser = wp_get_current_user();
    if(count($ourCurrentUser->roles) == 1 && $ourCurrentUser->roles[0] == "subscriber") {
        wp_redirect(site_url("/"));
        exit;
    }
}

add_action("wp_loaded", "noSubsAdminBar");

function noSubsAdminBar() {
    $ourCurrentUser = wp_get_current_user();

    if(count($ourCurrentUser->roles) == 1 && $ourCurrentUser->roles[0] == "subscriber") {
        show_admin_bar(false);
    }
}

// Customize the login screen
add_filter("login_headerurl", "ourHeaderUrl");

function ourHeaderUrl() {
    return esc_url(site_url("/"));
}

add_action("login_enqueue_scripts", "ourLoginCss");

function ourLoginCss() {
    wp_enqueue_style("custom-google-fonts", "//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i");
    wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    wp_enqueue_style('university_main_styles', get_theme_file_uri("/build/index.css"));
    wp_enqueue_style('university_extra_styles', get_theme_file_uri("/build/style-index.css"));
}

add_filter("login_headertext", "ourLoginTitle");

function ourLoginTitle() {
    return get_bloginfo("name");
}

// Force note to be private
add_filter("wp_insert_post_data", "makeNotePrivate", 10, 2);

function makeNotePrivate($data, $postarr) {
    if ($data["post_type"] == "note") {
        if (count_user_posts(get_current_user_id(), "note") > 4 && !$postarr["ID"]) {
            die("You have reached your note limit.");
        }
        $data["post_content"] = sanitize_textarea_field($data["post_content"]);
        $data["post_title"] = sanitize_text_field($data["post_title"]);
    }

    if($data["post_type"] == "note" && $data["post_status"] != "trash") {
        $data["post_status"] = "private";
    }

    return $data;
}