<?php
session_start();

// Define constants
define( 'ROOT', dirname( __FILE__ ) );

// Include config.
require_once( ROOT . '/config.php' );

// Include the Google API PHP Client
require_once( ROOT . '/google-api-php-client/autoload.php' );

// Include the MailChimp API
require_once( ROOT . '/mailchimp-api/Drewm/MailChimp.php' );

// Include the Content Score Report class
require_once( ROOT . '/content-score-report.class.php' );

// Initialize the Content Score Report class
$csr = new Content_Score_Report( $config );

// Check if callback from Google API.
if( isset( $_GET['code'] ) ) {
  $csr->authenticateGA( $_GET['code'] );

  header( "Location: " . $config['project_path'] );
}

$method = isset( $_POST['method'] ) ? trim( strip_tags( $_POST['method'] ) ) : false;

if( $method ) {
  $return = array();

  switch( $method ) {
    case 'checkConnections':
      $result = $csr->checkConnections();

      $return['gaConnection'] = $result['gaConnection'];
      $return['mcConnection'] = $result['mcConnection'];
      $return['gaURL']        = $result['gaURL'];
    break;
    case 'submitForm':
      $args = array(
        'viewID'    => isset( $_POST['viewID'] ) ? trim( strip_tags( $_POST['viewID'] ) ) : false,
        'type'      => isset( $_POST['type'] ) ? trim( strip_tags( $_POST['type'] ) ) : false,
        'path'      => isset( $_POST['path'] ) ? trim( strip_tags( $_POST['path'] ) ) : false,
        'startDate' => isset( $_POST['startDate'] ) ? trim( strip_tags( $_POST['startDate'] ) ) : false,
        'endDate'   => isset( $_POST['endDate'] ) ? trim( strip_tags( $_POST['endDate'] ) ) : false
      );

      switch( $args['type'] ) {
        case 'retention':
          $args['mcAPI'] = isset( $_POST['mcAPI'] ) ? trim( strip_tags( $_POST['mcAPI'] ) ) : false;
          $args['mcID']  = isset( $_POST['mcID'] ) ? trim( strip_tags( $_POST['mcID'] ) ) : false;
        break;
        case 'acquisition':
          $args['category'] = isset( $_POST['category'] ) ? trim( strip_tags( $_POST['category'] ) ) : false;
          $args['action']   = isset( $_POST['action'] ) ? trim( strip_tags( $_POST['action'] ) ) : false;
          $args['label']    = isset( $_POST['label'] ) ? trim( strip_tags( $_POST['label'] ) ) : false;
        break;
      }

      $return = $csr->getScore( $args );
    break;
    case 'deauthorize':
    	$csr->deauthorizeGA();
      $result = $csr->checkConnections();

      $return['gaConnection'] = $result['gaConnection'];
      $return['mcConnection'] = $result['mcConnection'];
      $return['gaURL']        = $result['gaURL'];
    break;
  }

  header( 'Content-Type: application/json' );

  echo json_encode( $return );
}
die();
