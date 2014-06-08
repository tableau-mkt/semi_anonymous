<?php
/**
 * @file
 * Definition of semi_anonymous_views_plugin_exposed_form_auto_filter.
 */


 /**
 * Exposed form plugin that allows auto-selecting exposed filters from client-side user values.
 */
class semi_anonymous_exposed_form_auto_filter extends views_plugin_exposed_form_basic {

  function option_definition() {
    $options = parent::option_definition();

    // Add auto-select filters options to those saved by Views.
    $options['semi_anonymous_auto_filter'] = array('default' => array());
    return $options;
  }

  // Add option to form.
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    $auto_options = array();
    // Get current settings and default values for new filters.
    $existing = $this->get_settings();

    $auto_options['semi_anonymous_auto_filter_wrapper'] = array(
      '#type' => 'fieldset',
      '#title' => t('Semi Anonymous Auto-filter'),
      '#description' => t('Allows exposed filters to be automatically selected via client-side user profiling values. Use the machine name of the taxonomy vocab to match with this filter. Recommended to use with AJAX Views'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    );

    // Go through each filter and add DB mapping option.
    foreach ($this->display->handler->get_handlers('filter') as $label => $filter) {
      if (!$filter->options['exposed']) {
        continue;
      }
      $auto_options['semi_anonymous_auto_filter_wrapper'][$label]['data_property'] = array(
        '#type' => 'textfield',
        '#title' => t('Data property for "@identifier" exposed filter', array('@identifier' => $filter->options['expose']['identifier'])),
        '#default_value' => $existing[$label]['data_property'],
        '#size' => 40,
        '#maxlength' => 128,
      );
      $auto_options['semi_anonymous_auto_filter_wrapper'][$label]['hidden'] = array(
        '#type' => 'checkbox',
        '#title' => t('Hide "@identifier"', array('@identifier' => $filter->options['expose']['identifier'])),
        '#default_value' => $existing[$label]['hidden'],
      );
    }

    // Fieldset for UI sanity.
    $form['semi_anonymous_auto_filter'] = $auto_options;
  }

  /**
   * Attach the behavior to filter form.
   */
  function exposed_form_alter(&$form, &$form_state) {
    parent::exposed_form_alter($form, $form_state);

    // Tell the client-side what to filter.
    $settings = $this->get_settings();
    $auto_settings[$this->view->name][$this->display->id] = $settings;

    if (!empty($settings)) {

      // Special filter settings handling.
      $hidden = array();
      foreach ($settings as $id => $filter) {
        if ($filter['hidden']) {
          // Replicate the Views class selectors.
          $hidden[] = str_replace('_', '-', "#views-exposed-form-{$this->view->name}-{$this->display->id}") .
            " .views-widget-filter-$id";
        }
      }

      // Hide appropriate filters.
      if (count($hidden) > 0) {
        $form['#attached']['css'][] = array(
          'data' => implode(', ', $hidden) . ' { display:none; }',
          'type' => 'inline',
        );
        // All are hidden, hide the filter wrapper.
        if (count($hidden) == count($settings)) {
          $form_id = ".view-id-{$this->view->name}.view-display-id-{$this->display->id} .view-filters";
          $form['#attached']['css'][] = array(
            'data' => $form_id . ' { display:none; }',
            'type' => 'inline',
          );
        }
      }

      // Add filter settings and other client-side components for this form.
      $form['#attributes']['class'][] = 'semi-anonymous-auto-filter';
      if(variable_get('semi_anonymous_auto_filter_toggle', FALSE)) {
        // NOTE: Could add within preprocess hook, but de-duping handles it for us.
        $form['#attached']['js'][] = array(
          'data' => array('semi_anonymous' => array(
            'views_filters' => $auto_settings)
          ),
          'type' => 'setting'
        );
        $form['#attached']['js'][] = drupal_get_path('module', 'semi_anonymous') . '/views/auto_filter.js';
        $form['#attached']['js'][] = libraries_get_path('jquery-waypoints') . '/waypoints.min.js';
      }
    }
  }


  /**
   * Largely borrowed from Better Exposed Filters...
   */

  /**
   * Returns an array of default or current existing values for option settings.
   *
   * @return array
   *   Multi-dimensional settings array
   */
  protected function get_settings() {
    // Settings for the whole display.
    $global_defaults = array();

    $current = $this->options['semi_anonymous_auto_filter']['semi_anonymous_auto_filter_wrapper'];
    // Collect existing values or use defaults.
    $settings = $this->set_defaults($global_defaults, $current);

    // Filter default values.
    $filter_defaults = array(
      'data_property' => NULL,
      'hidden' => TRUE,
    );

    // Go through each exposed filter and collect settings
    foreach ($this->display->handler->get_handlers('filter') as $label => $filter) {
      if (!$filter->options['exposed']) {
        continue;
      }
      // Get existing values or use defaults
      if (!isset($this->options['semi_anonymous_auto_filter']['semi_anonymous_auto_filter_wrapper'][$label])) {
        // First time opening the settings form with a new filter
        $settings[$label] = $filter_defaults;
      }
      else {
        $settings[$label] = $this->set_defaults(
          $filter_defaults,
          $this->options['semi_anonymous_auto_filter']['semi_anonymous_auto_filter_wrapper'][$label]
        );
      }
    }
    return $settings;
  }

  /**
   * Similar to array_merge_recursive, but later numeric keys overwrites earlier values.
   * Use this to set defaults for missing values in a multi-dimensional array.
   *
   * @return array
   *   The resulting array
   */
  protected function set_defaults() {
    $count = func_num_args();
    if (!$count) {
      return;
    }
    else if (1 == $count) {
      return (func_get_arg(0));
    }

    // First array is the default values.
    $params = func_get_args();
    $return = array_shift($params);

    // Merge the rest of the arrays onto the default array.
    foreach ($params as $array) {
      foreach ($array as $key => $value) {
        // Numeric keyed values are added (unless already there)
        if (is_numeric($key) && !in_array ($value, $return)) {
          if (is_array($value)) {
            $return [] = $this->set_defaults($return[$key], $value);
          } else {
            $return [] = $value;
          }

        // String keyed values are replaced.
        } else {
          if (isset($return[$key]) && is_array($value) && is_array($return[$key])) {
            $return[$key] = $this->set_defaults($return[$key], $value);
          } else {
            $return[$key] = $value;
          }
        }
      }
    }
    return $return;
  }

}
