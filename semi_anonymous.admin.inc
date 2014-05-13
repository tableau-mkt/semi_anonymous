<?php

/**
 * Form callback for module configuration.
 */
function semi_anonymous_settings_form($form_state) {
  $form = array();
  $vocabs = taxonomy_get_vocabularies();
  $v_options = array();
  foreach ($vocabs as $v) {
    $v_options[$v->machine_name] = $v->name;
  }

  $form['global'] = array(
    '#type' => 'fieldset',
    '#title' => t('Global'),
    '#collapsible' => FALSE,
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
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 3,
  );
  $form['user']['semi_anonymous_store_user_origins'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'disabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => FALSE),
      ),
    ),
    '#title' => t('Store a user\'s origins'),
    '#default_value' => variable_get('semi_anonymous_store_user_origins', TRUE),
    '#description' => t('Capture both the first page origin of this user AND the most recent session entry point, overwritten each time a page is directly visited with no referrer.'),
  );
  $form['user']['semi_anonymous_track_page'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'disabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => FALSE),
      ),
    ),
    '#title' => t('Track user browsing'),
    '#default_value' => variable_get('semi_anonymous_track_page', FALSE),
    '#description' => t('Store users\'s page browsing history in the user object.'),
  );
  $form['user']['semi_anonymous_track_page_extent'] = array(
    '#type' => 'select',
    '#states' => array(
      'disabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => FALSE),
      ),
    ),
    '#title' => t('How far back to track'),
    '#options' => array(
       '10' => t('10 items'),
       '25' => t('25 items'),
       '50' => t('50 items'),
       '100' => t('100 items'),
       '0' => t('All'),
    ),
    '#default_value' => variable_get('semi_anonymous_track_page_extent', 25),
    '#description' => t('Size of tracking history. '),
  );
  /*
  // @todo Merge other client-side user objects and stash them to avoid constant re-generation.
  $form['user']['semi_anonymous_merge_user_data'] = array(
    '#type' => 'textarea',
    '#cols' => 70,
    '#title' => t('Merge user objects'),
    '#default_value' => (variable_get('semi_anonymous_merge_user_data', FALSE)) ? drupal_implode_tags(variable_get('semi_anonymous_reference_user_data', '')) : '',
    '#description' => t('Merge in other client-side user objects into this standardized namespace. Examples: myAnalytics.user, myThirdPartyUserObject'),
  );
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
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 5,
  );
  $form['content']['semi_anonymous_add_page_meta'] = array(
    '#type' => 'checkbox',
    '#title' => t('Add entity meta data'),
    '#default_value' => variable_get('semi_anonymous_add_page_meta', FALSE),
    '#description' => t('Make entity meta data available for client-side reaction.'),
  );
  $form['content']['semi_anonymous_track_term_hits'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => TRUE),
        ':input[name="semi_anonymous_add_page_meta"]' => array('checked' => TRUE),
      ),
    ),
    '#title' => t('Track term hits'),
    '#default_value' => variable_get('semi_anonymous_track_term_hits', FALSE),
    '#description' => t('Tracks "hits" to terms present on content while browsing. Requires entity meta data output.'),
  );
  $form['content']['track_vocabs'] = array(
    '#type' => 'fieldset',
    '#title' => t('Vocabs to track'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  $form['content']['track_vocabs']['semi_anonymous_track_term_vocabs'] = array(
    '#type' => 'checkboxes',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => TRUE),
        ':input[name="semi_anonymous_add_page_meta"]' => array('checked' => TRUE),
        ':input[name="semi_anonymous_track_term_hits"]' => array('checked' => TRUE),
      ),
    ),
    '#title' => t('Vocabs to track'),
    '#default_value' => variable_get('semi_anonymous_track_term_vocabs', 0),
    '#options' => $v_options,
    '#description' => t('The vocabs which should output and tracked when recording "hits" to terms on content. Requires term hit tracking and entity meta data output.'),
  );
  $form['content']['semi_anonymous_generate_favorites'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => TRUE),
        ':input[name="semi_anonymous_track_term_hits"]' => array('checked' => TRUE),
        ':input[name="semi_anonymous_add_page_meta"]' => array('checked' => TRUE),
      ),
    ),
    '#title' => t('Generate favorite term per vocab'),
    '#default_value' => variable_get('semi_anonymous_generate_favorites', FALSE),
    '#description' => t('Calculates a favorite term per vocab and place it on the user object. Requires tracking term hits.'),
  );

  return system_settings_form($form);
}
