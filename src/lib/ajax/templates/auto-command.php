<?php

namespace Seravo\Ajax;

use \Seravo\Postbox\Component;
use \Seravo\Postbox\Template;

/**
 * Class AutoCommand
 *
 * AutoCommand is pre-made AjaxHandler for automatically executing
 * a single command and showing the output.
 *
 * Adds component for the output.
 */
class AutoCommand extends AjaxHandler {

  /**
   * @var string|null Command to be executed on AJAX request.
   */
  private $command;

  /**
   * @var bool Whether exit code other than 0 should respond with an error.
   */
  private $allow_failure = false;

  /**
   * Constructor for AjaxHandler. Will be called on new instance.
   * @param string $section Unique section inside the postbox.
   * @param string|null $command Command to be executed.
   * @param int $cache_time Seconds to cache response for (default is 300).
   * @param bool $allow_failure Whether exit code other than 0 should respond with an error.
   */
  public function __construct( $section, $command = null, $cache_time = 300, $allow_failure = false ) {
    parent::__construct($section);

    $this->command = $command;
    $this->allow_failure = $allow_failure;

    $this->set_build_func(
      function ( Component $base, $section ) {
        return $this->build_component($base, $section);
      }
    );
    $this->set_ajax_func(
      function ( $section ) {
        return $this->ajax_command_exec($section);
      },
      $cache_time
    );
  }

  /**
   * This is called on valid AJAX request.
   * Command is executed here.
   * @param string $section Unique section inside the postbox.
   * @return \Seravo\Ajax\AjaxResponse Response for the client.
   */
  public function ajax_command_exec( $section ) {
    if ( $this->command === null ) {
      return AjaxResponse::unknown_error_response();
    }

    $output = null;
    $retval = null;
    exec($this->command, $output, $retval);

    if ( $retval !== 0 && ! $this->allow_failure ) {
      return AjaxResponse::command_error_response($this->command);
    }

    $output = empty($output) ? __('Command returned no data', 'seravo') : implode("\n", $output);

    $response = new AjaxResponse();
    $response->is_success(true);
    $response->set_data(
      array(
        'output' => $output,
      )
    );
    return $response;
  }

  /**
   * Component needed for the AJAX handler.
   * Can be gotten with get_component().
   * @param \Seravo\Postbox\Component $base Base component.
   * @param string $section Unique section inside the postbox.
   */
  public function build_component( Component $base, $section ) {
    $component = new Component();
    $component->set_wrapper("<div class=\"seravo-ajax-auto-command\" data-section=\"{$section}\">", '</div>');
    $component->add_child(Template::spinner($section . '-spinner', ''));
    $component->add_child(Template::simple_command_output($section . '-output', 'hidden'));

    $base->add_child($component);
  }

  /**
   * Set the command to be executed.
   * @param string $command Command for exec.
   */
  public function set_command( $command ) {
    $this->command = $command;
  }

  /**
   * Set whether exit code other than 0 should respond with an error.
   * @param bool $allow_failure Whether to allow failure.
   */
  public function allow_failure( $allow_failure ) {
    $this->allow_failure = $allow_failure;
  }

}