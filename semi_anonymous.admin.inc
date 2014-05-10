<?php

/**
 * Form callback for module configuration.
 */
function semi_anonymous_settings_form($form_state) {
  $form = array();

  $form['global'] = array(
    '#type' => 'fieldset',
    '#title' => t('Global'),
    '#collapsable' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 0,
  );
  $form['global']['semi_anonymous_include'] = array(
    '#type' => 'checkbox',
    '#title' => t('Include local storage libraries everywhere.'),
    '#default_value' => variable_get('semi_anonymous_include', TRUE),
    '#description' => t('Load libary to create space for local storage data to live.'),
  );

  $form['user'] = array(
    '#type' => 'fieldset',
    '#title' => t('User'),
    '#collapsable' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 3,
  );
  $form['user']['semi_anonymous_store_user_origins'] = array(
    '#type' => 'checkbox',
    '#title' => t('Store a user\'s origins'),
    '#default_value' => variable_get('semi_anonymous_store_user_origins', TRUE),
    '#description' => t('Capture both the true first page seen by this user AND the session origin, which will be overwritten each time a page is directly visited with no referrer.'),
  );
  $form['user']['semi_anonymous_track_browsing'] = array(
    '#type' => 'checkbox',
    '#title' => t('Track user browsing'),
    '#default_value' => variable_get('semi_anonymous_track_browsing', FALSE),
    '#description' => t('Store users\'s browsing history in the user object.'),
  );
  $form['user']['semi_anonymous_track_browsing_extent'] = array(
    '#type' => 'select',
    '#title' => t('How far back to track'),
    '#options' => array(
       '10' => t('10 items'),
       '25' => t('25 items'),
       '50' => t('50 items'),
       '100' => t('100 items'),
       '0' => t('All'),
    ),
    '#default_value' => variable_get('semi_anonymous_track_browsing_extent', 25),
    '#description' => t('Size of tracking history. '),
  );
  $form['user']['semi_anonymous_reference_user_data'] = array(
    '#type' => 'textarea',
    '#cols' => 70,
    '#title' => t('Store user object from source'),
    '#default_value' => (variable_get('semi_anonymous_reference_user_data', FALSE)) ? drupal_implode_tags(variable_get('semi_anonymous_reference_user_data', '')) : '',
    '#description' => t('Merge other user objects into this standardized namespace. Examples: myThirdPartyUserObject'),
  );
  /*
  // @todo: Save and restore user data for past authenticated user sessions.
  $form['user']['semi_anonymous_user_save'] = array(
    '#type' => 'checkbox',
    '#title' => t('Save/restore user data'),
    '#default_value' => variable_get('semi_anonymous_user_save', FALSE),
    '#description' => t('Save user data to database for authenticated users. Will be restored and merged upon login.'),
  );
  */

  $form['content'] = array(
    '#type' => 'fieldset',
    '#title' => t('Content'),
    '#collapsable' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 5,
  );
  $form['content']['semi_anonymous_add_page_meta'] = array(
    '#type' => 'checkbox',
    '#title' => t('Add entity meta data'),
    '#default_value' => variable_get('semi_anonymous_add_page_meta', FALSE),
    '#description' => t('Make entity meta data available for client-side reaction.'),
  );
  $form['user']['semi_anonymous_track_term_hits'] = array(
    '#type' => 'checkbox',
    '#title' => t('Track term hits'),
    '#default_value' => variable_get('semi_anonymous_track_term_hits', FALSE),
    '#description' => t('Track terms present on content while browsing.'),
  );
  
  
  $form['content']['semi_anonymous_taxonomy_tracking'] = array(
    '#type' => 'checkbox',
    '#title' => t('Track term interest browsing'),
    '#default_value' => variable_get('semi_anonymous_taxonomy_tracking', FALSE),
    '#description' => t('Track terms present on content while browsing.'),
  );
  $form['content']['semi_anonymous_generate_favorites'] = array(
    '#type' => 'checkbox',
    '#title' => t('Generate favorite term per vocab'),
    '#default_value' => variable_get('semi_anonymous_generate_favorites', FALSE),
    '#description' => t('Calculates a favorite term per vocab and place it on the user object. Requires tracking term hits.'),
  );

  return system_settings_form($form);
}
