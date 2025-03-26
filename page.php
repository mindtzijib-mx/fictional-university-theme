<?php 

    get_header();

    while (have_posts()) {
        the_post(  ); 
        page_banner();
        ?>


    <div class="container container--narrow page-section">
      <?php 
      // If the page has a parent, display the breadcrumb
      $idParent = wp_get_post_parent_id(get_the_ID());
      
      if ($idParent) { ?>
        <div class="metabox metabox--position-up metabox--with-home-link">
          <p>
            <a class="metabox__blog-home-link" href="<?php echo get_permalink($idParent); ?>"><i class="fa fa-home" aria-hidden="true"></i> Back to <?php echo get_the_title($idParent); ?></a> <span class="metabox__main"><?php the_title(); ?></span>
          </p>
        </div>
      <?php } ?>

      <?php

      $hasChildrenPages = get_pages(array(
        'child_of' => get_the_ID()
      ));

      if ($idParent || $hasChildrenPages) { ?>

        <div class="page-links">
          
          <h2 class="page-links__title"><a href="<?php echo get_permalink($idParent) ?>"><?php echo get_the_title($idParent) ?></a></h2>
          <ul class="min-list">

            <?php
            if ($idParent) {
              // It is a child page
              $findChildrenOf = $idParent;
            } else {
              // It is a parent page
              $findChildrenOf = get_the_ID();
            }
            
              wp_list_pages(array(
                'title_li' => NULL,
                'child_of' => $findChildrenOf,
                'sort_column' => 'menu_order'
              ));
            
            ?>
          </ul>
        </div>
      <?php } ?>

      <div class="generic-content">
        <?php the_content(); ?>
      </div>
    </div>

    <?php }

    get_footer();

?>