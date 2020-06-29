// phpcs:disable PEAR.Functions.FunctionCallSignature
'use strict';

jQuery(document).ready(function($) {
  // Search-replace-tool script
  var dryrun_ran = 0;
  // Modified from the original seravo_load_report to handle tables and tsv's
  function seravo_load_sr_report(section, from, to, options) {
    jQuery.post(
      seravo_database_loc.ajaxurl, {
        'action': 'seravo_search_replace',
        'section': section,
        'from': from,
        'to': to,
        'options': options,
        'nonce': seravo_database_loc.ajax_nonce,
      },
      function (rawData) {
        if (rawData.length === 0) {
          jQuery('#' + section).html('No data returned for section.');
        }
        var data = JSON.parse(rawData);

        // Loops through the data array row by row
        jQuery.each(data, function (i, row) {
          var tr = jQuery('<tr>');
          // Loops through the row column by column
          jQuery.each(row.split('\t'), function (j, col) {
            if (i === 0) {
              // Command row
              jQuery('#search_replace_command').append('<code>' + col + '</code>');
            } else if (i === 1) {
              // Title row
              jQuery('<td>').html(col.replace("Replacements", "Count")).appendTo(tr);
            } else {
              // Result rows rows
              // Make 'table' and 'column' columns wrap
              var td_class = j <= 1 ? 'sr_result_field' : '';
              jQuery('<td class="' + td_class + '">').html(col).appendTo(tr);
            }
          })
          jQuery('#search_replace_loading img').fadeOut();
          jQuery('#search_replace').append(tr);
        });
        jQuery('#sr-button').prop('disabled', false);
      }
    ).fail(function () {
      jQuery('.' + section + '_loading').html('Failed to load. Please try again.');
    });
  }

  // Load when clicked.
  jQuery('.sr-button').click(function () {
    jQuery('#search_replace_loading img').fadeIn();
    jQuery('#search_replace').empty();
    jQuery('#search_replace_command').empty();

    var options = {};
    if (jQuery(this).attr('id') === "sr-button") {
      options['dry_run'] = false;
    } else {
      options['dry_run'] = true;
    }
    jQuery.each(jQuery('.optionbox'), function (i, option) {
      options[jQuery(option).attr('id')] = jQuery(option).is(':checked');
    });
    seravo_load_sr_report('search_replace', jQuery('#sr-from').val(), jQuery('#sr-to').val(), options);
  });

  jQuery('#all_tables').click(function () {
    if (jQuery(this).is(':checked')) {
      jQuery('#sr-button').prop('disabled', true);
      jQuery('#skip_backup').prop('checked', false);
    }
  });

  jQuery('#sr-from').keyup(function (event) {
    jQuery('#sr-button').prop('disabled', true);
    dryrun_ran = 0;
  });

  jQuery(document).ready(function () {
    jQuery('#sr-button').prop('disabled', true);
    jQuery('#skip_backup').prop('checked', false);
  });

  // Load the database cleanup
  function seravo_load_cleanup_report(section, options) {
    jQuery.post(
      seravo_database_loc.ajaxurl, {
        'action': 'seravo_db_cleanup',
        'section': section,
        'options': options,
        'nonce': seravo_database_loc.ajax_nonce,
      },
      function (rawData) {
        if (rawData.length === 0) {
          jQuery('#' + section).html('No data returned for section.');
        }
        var data = JSON.parse(rawData);

        // Loops through the data array row by row
        jQuery.each(data, function (i, row) {
          var tr = jQuery('<tr>');
          // Loops through the row column by column
          jQuery.each(row.split('\t'), function (j, col) {
            if (i === 0) {
              // Command row
              jQuery('#cleanup_command').append('<code>' + col + '</code>');
            } else if (i === 1) {
              // Title row
              jQuery('<td>').html(col.replace("Replacements", "Count")).appendTo(tr);
            } else {
              // Result rows rows
              // Make 'table' and 'column' columns wrap
              var td_class = j <= 1 ? 'sr_result_field' : '';
              jQuery('<td class="' + td_class + '">').html(col).appendTo(tr);
            }
          })
          jQuery('#cleanup_loading img').fadeOut();
          jQuery('#db_cleanup').append(tr);
        });
        jQuery('#cleanup-button').prop('disabled', false);
      }
    ).fail(function () {
      jQuery('#' + section + '_loading').html('Failed to load. Please try again.');
    });
  }

  jQuery('.cleanup-button').click(function () {
    jQuery('#cleanup_loading img').fadeIn();
    jQuery('#db_cleanup').empty();
    jQuery('#cleanup_command').empty();

    var options = {};
    if (jQuery(this).attr('id') === "cleanup-button") {
      options['dry_run'] = false;
    } else {
      options['dry_run'] = true;
    }
    seravo_load_cleanup_report('db_cleanup', options);
  });

  jQuery(document).ready(function () {
    jQuery('#cleanup-button').prop('disabled', true);
  });

  // Database table sizes script
  // Load db info with ajax because it might take a little while
  function seravo_load_db_info(section) {
    jQuery.post(
      seravo_database_loc.ajaxurl, {
        'action': 'seravo_wp_db_info',
        'section': section,
        'nonce': seravo_database_loc.ajax_nonce,
      },
      function (rawData) {
        if (rawData.length == 0) {
          jQuery('#' + section).html('No data returned for section.');
        }
        var data = JSON.parse(rawData);
        if (section === 'seravo_wp_db_info') {
          jQuery('#seravo_wp_db_info').append(data.totals);
          generateDatabaseBars(data.tables.data_folders);
        } else {
          jQuery('#' + section).text(data.join("\n"));
        }
        jQuery('.' + section + '_loading').fadeOut();
      }
    ).fail(function () {
      jQuery('.' + section + '_loading').html('Failed to load. Please try again.');
    });
  }

  // Postbox toggle script
  // Load on page load
  seravo_load_db_info('seravo_wp_db_info');
});
