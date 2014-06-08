<?php

/**
 * Form callback for module configuration.
 */
function semi_anonymous_settings_form($form_state) {
  // Init.
  $form = array();
  // Setup vocabs.
  $vocabs = taxonomy_get_vocabularies();
  $v_options = array();
  foreach ($vocabs as $v) {
    $v_options[$v->machine_name] = $v->name;
  }
  // Get available meta data.
  $meta_data = _semi_anonymous_collect_meta();

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
    '#title' => t("Store a user's origins"),
    '#default_value' => variable_get('semi_anonymous_store_user_origins', TRUE),
    '#description' => t('Capture both the first page origin of this user AND the most recent session entry point, overwritten each time a page is directly visited with no referrer.'),
  );
  $form['user']['semi_anonymous_track_browsing'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'disabled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => FALSE),
      ),
    ),
    '#title' => t('Track user browsing'),
    '#default_value' => variable_get('semi_anonymous_track_browsing', FALSE),
    '#description' => t("Store users's page browsing history in the user object."),
  );
  $form['user']['semi_anonymous_track_browsing_extent'] = array(
    '#type' => 'select',
    '#states' => array(
      'enbled' => array(
        ':input[name="semi_anonymous_include"]' => array('checked' => TRUE),
        ':input[name="semi_anonymous_track_browsing"]' => array('checked' => TRUE),
      ),
    ),
    '#title' => t('How far back to track'),
    '#options' => array(
      '10' => t('10 items'),
      '25' => t('25 items'),
      '100' => t('100 items'),
      '500' => t('500 items'),
      '2500' => t('2500 items'),
      '0' => t('All'),
    ),
    '#default_value' => variable_get('semi_anonymous_track_browsing_extent', SEMI_ANON_EXTENT),
    '#description' => t('Size of tracking history.'),
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
  $form['content']['track_meta'] = array(
    '#type' => 'fieldset',
    '#title' => t('Tracking Meta Data'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#description' => t('The meta data details to store when tracking browsing history. Marking none will track all.'),
  );
  $form['content']['semi_anonymous_output_terms'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_anonymous_add_page_meta"]' => array('checked' => TRUE),
      ),
    ),
    '#title' => t('Add taxonomy terms'),
    '#default_value' => variable_get('semi_anonymous_output_terms', FALSE),
    '#description' => t('Make taxonomy term data available for client-side use.'),
  );
  $form['content']['track_meta']['semi_anonymous_track_meta'] = array(
    '#type' => 'checkboxes',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_add_page_meta"]' => array('checked' => TRUE),
      ),
    ),
    '#default_value' => variable_get('semi_anonymous_track_meta', 0),
    '#options' => drupal_map_assoc($meta_data),
  );
  $form['content']['semi_anonymous_track_term_hits'] = array(
    '#type' => 'checkbox',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_anonymous_output_terms"]' => array('checked' => TRUE),
      ),
    ),
    '#title' => t('Track term hits'),
    '#default_value' => variable_get('semi_anonymous_track_term_hits', FALSE),
  );
  $form['content']['track_vocabs'] = array(
    '#type' => 'fieldset',
    '#title' => t('Vocabularies'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#description' => t('The vocabularies which should be output as meta data and tracked when recording "hits" to terms on content.'),
  );
  $form['content']['track_vocabs']['semi_anonymous_track_term_vocabs'] = array(
    '#type' => 'checkboxes',
    '#states' => array(
      'enabled' => array(
        ':input[name="semi_anonymous_track_term_hits"]' => array('checked' => TRUE),
      ),
    ),
    '#default_value' => variable_get('semi_anonymous_track_term_vocabs', 0),
    '#options' => $v_options,
  );

  $form['views'] = array(
    '#type' => 'fieldset',
    '#title' => t('Views'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 10,
  );
  $form['views']['semi_anonymous_auto_filter_toggle'] = array(
    '#type' => 'checkbox',
    '#title' => t('Auto-filter toggle'),
    '#default_value' => variable_get('semi_anonymous_auto_filter_toggle', FALSE),
    '#description' => t("When enabled (default), Views filters configured to use the this plugin will set filters with client-side user values. It's recommended Views should be AJAX. For performance reasons you may want to disable this. Hidden filters will stay hidden when disabled, but AJAX form submit will not be triggered."),
  );
  $form['views']['semi_anonymous_auto_filter_threshold'] = array(
    '#type' => 'textfield',
    '#size' => 5,
    '#title' => t('Auto-filter threshold'),
    '#default_value' => variable_get('semi_anonymous_auto_filter_threshold', SEMI_ANON_THRESHOLD),
    '#description' => t("Set the browsing history term hit count required to auto-trigger a filter. You want to be sure a user's interest is real before you change the UX."),
  );
  $form['views']['semi_anonymous_auto_filter_link_analysis'] = array(
    '#type' => 'checkbox',
    '#title' => t('Add link analysis params'),
    '#default_value' => variable_get('semi_anonymous_auto_filter_link_analysis', FALSE),
    '#description' => t("In order to track successful conversions from links within auto-filtered Views, you can add analysis query params with the name of the View block, display, and filter value."),
  );

  return system_settings_form($form);
}
