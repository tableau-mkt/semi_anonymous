/**
 * @file Tableau-specific events activities.
 */

/* global dataLayer, DataLayerHelper */

(function ($, window, dataLayer) {
  Drupal.behaviors.semiAnonymousFormSubmit = {
    attach: function (context, settings) {

      // AJAX protection.
      if (context !== document) { return; }

      // Record configured form submits meta data.
      $('form').submit(function() {
        var $form = $(this),
            formList = settings.semiAnonymous.recordForms,
            formFields = settings.semiAnonymous.recordFormFields,
            formId = $form.find('input[name="form_id"]').val(),
            dlHelper = new DataLayerHelper(dataLayer),
            stashedFormActivity;

        // Ensure any forms are configured.
        if (formList.length === 0 || $.inArray(formId, formList) >= 0) {
          // Collect default form and page data.
          stashedFormActivity = {
            formId: formId,
            url: window.location.href,
            entityBundle: dlHelper.get('entityBundle'),
            entityId: dlHelper.get('entityId'),
            entityTnid: dlHelper.get('entityTnid'),
          };
          // Collect configured form fields, to augment stashed activity.
          $.each(formFields, function grabFieldData (index, field) {
            stashedFormActivity[field] = $form.find('input[name="' + field + '"]').val();
          });
          // Record event.
          groucho.createActivity('formSubmit', stashedFormActivity);
        }
      });

    }
  };
})(jQuery, window, dataLayer);
