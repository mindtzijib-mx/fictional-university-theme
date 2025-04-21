<?php 

get_header();
page_banner(
  array(
    "title" => "Search Results",
    "subtitle" => "You searched for: " . get_search_query()
  )
);

?>

<div class="container container--narrow page-section">
  <?php
  if (have_posts()) {
    while (have_posts()) {
        the_post(  ); 
        get_template_part("template-parts/content", get_post_type());
    }
    echo paginate_links(); 
  } else {
    echo "<h2 class='headline headline--small-plus'>No results found</h2>";
  } 
  
  get_search_form();
  
  ?>
</div>

<?php get_footer(); ?>