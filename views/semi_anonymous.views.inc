<?php

/**
 * @file
 * Views API hooks.
 */


/**
 * Implements hook_views_plugins().
 */
function semi_anonymous_views_plugins() {
  return array(
    'exposed_form' => array(
      'semi_anonymous_auto_filter' => array(
        'title' => t('Semi Anonymous Auto-filter'),
        'help' => t('Allows exposed filters to be automatically selected via client-side user profiling values.'),
        'handler' => 'semi_anonymous_exposed_form_auto_filter',
        'uses options' => TRUE,
        'help topic' => 'exposed-form-auto-filter',
      ),
    ),
  );
}
