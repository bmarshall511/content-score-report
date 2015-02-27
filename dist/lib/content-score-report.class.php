<?php

class Content_Score_Report {
	var $client;

	public function __construct( $config ) {
		$this->config = $config;
	}

	public function checkConnections() {
		$return = array(
			'gaConnection' => false,
			'mcConnection' => false,
			'gaURL'        => false
		);

		// Connect to the GA API.
		$result = $this->authenticateGA();
		$return['gaConnection'] = $result['connected'];
		$return['gaURL'] = $result['url'];

		return $return;
	}

	public function deauthorizeGA() {
		$_SESSION['access_token'] = false;
		session_destroy();
		$result = $this->authenticateGA();
	}

	public function authenticateGA( $code = false ) {
		$return = array(
			'connected' => false,
			'url'       => false
		);

		$this->_gaConnect();

		if( $code ) {
			$response = $this->client->authenticate( $code );
			$_SESSION['access_token'] = $this->client->getAccessToken();
		}

		if( isset( $_SESSION['access_token'] ) && $_SESSION['access_token'] ) {
			$this->client->setAccessToken( $_SESSION['access_token'] );

			if( $this->client->isAccessTokenExpired() ) {
      	$this->client->authenticate();
      	$newToken = json_decode( $this->client->getAccessToken() );
       	$this->client->refreshToken( $newToken->refresh_token );
    	}

    	$return['connected'] = true;
		} else {
			$return['url'] = $this->client->createAuthUrl();
		}

		return $return;
	}

	public function getScore( $args ) {
		$return = array(
			"errors"          => array(),
			"gaData"          => array(),
			"mcData"          => array(),
			"retention_score" => array()
		);

		foreach( $args as $key => $val ) {
			if( ! $val ) {
				$return['errors'][] = "Missing required parameter: " . $key;
			}
		}

		if( ! count( $return['errors'] ) ) {

			// Get data from Google Analytics.
			try {
				$connect = $this->authenticateGA();
				if( $connect['connected'] ) {

					$analytics    = new Google_Service_Analytics( $this->client );
					$analytics_id = 'ga:' . $args['viewID'];

					$optParams = array();
		      $optParams['filters'] = "ga:pagePath==" . $args['path'];
		      $metrics              = 'ga:uniquePageviews,ga:avgTimeOnPage';
		      $result               = $analytics->data_ga->get( $analytics_id,
		                              date( 'Y-m-d', strtotime( $args['startDate'] ) ),
		                              date( 'Y-m-d', strtotime( $args['endDate'] ) ), $metrics, $optParams);

		      if( $result->getRows() ) {
		      	$results = $result->getRows();

		      	$metricsAry = explode( ",", $metrics );
		      	foreach( $metricsAry as $key => $val ) {
		      		$return['gaData'][$val] = $results[0][$key];
		      	}

		      	$return['gaData'] = $this->_parseGAData( $return['gaData'] );
		      } else {
		      	$return['errors'][] = "No data available.";
		      }
		    } else {
		    	$return['errors'][] = "Not connected to the Google API.";
		    }
			} catch(Exception $e) {
				$return['errors'][] = "There was an error : - " . $e->getMessage();
	  	}

	  	// Get data from MailChimp.
  		$MailChimp = new \drewm\MailChimp( $args['mcAPI'] );

  		$return['mcData'] = $this->_parseMCData( $MailChimp->call( 'reports/summary', array(
    		'cid' => $args['mcID']
  		)));

  		// Calculate retention score.
  		if(
  			isset( $return['mcData']['open_rate'] ) && $return['mcData']['open_rate'] &&
  			isset( $return['gaData']['unique_pageviews'] ) && $return['gaData']['unique_pageviews'] &&
  			isset( $return['gaData']['avg_time'] ) && $return['gaData']['avg_time']
  		) {
	  		$return['retention_score'] = $this->_calculateRetentionScore( array(
	  			'open_rate'        => $return['mcData']['open_rate'],
	  			'unique_pageviews' => $return['gaData']['unique_pageviews'],
	  			'avg_time'         => $return['gaData']['avg_time']
	  		));
	  	} else {
	  		$return['errors'][] = "Not enough data to calculate the retention score.";
	  	}
	  }

  	return $return;
	}

	private function _calculateRetentionScore( $data ) {
		$return = array(
    	'open_rate_score' => 0,
    	'pageviews_score' => 0,
    	'avg_time_score'  => 0
    );

    // Calculate open rate score.
    switch( $data['open_rate'] ) {
    	case $data['open_rate'] < 38:
    		$return['open_rate_score'] = 10;
    	break;
    	case $data['open_rate'] >= 38 && $data['open_rate'] <= 41:
    		$return['open_rate_score'] = 20;
    	break;
    	case $data['open_rate'] > 41 && $data['open_rate'] <= 43:
    		$return['open_rate_score'] = 30;
    	break;
    	case $data['open_rate'] > 43 && $data['open_rate'] <= 45:
    		$return['open_rate_score'] = 40;
    	break;
    	case $data['open_rate'] > 45:
    		$return['open_rate_score'] = 50;
    	break;
    }

    // Calculate pageviews score.
    switch( $data['unique_pageviews'] ) {
    	case $data['unique_pageviews'] <= 50:
    		$return['pageviews_score'] = 10;
    	break;
    	case $data['unique_pageviews'] > 50 && $data['unique_pageviews'] <= 200:
    		$return['pageviews_score'] = 20;
    	break;
    	case $data['unique_pageviews'] > 200 && $data['unique_pageviews'] <= 475:
    		$return['pageviews_score'] = 30;
    	break;
    	case $data['unique_pageviews'] > 475 && $data['unique_pageviews'] <= 750:
    		$return['pageviews_score'] = 40;
    	break;
    	case $data['unique_pageviews'] > 750:
    		$return['pageviews_score'] = 50;
    	break;
    }

    // Calculate average time on page score.
    switch( $data['avg_time'] ) {
    	case $data['avg_time'] <= 60:
    		$return['avg_time_score'] = 10;
    	break;
    	case $data['avg_time'] > 60 && $data['avg_time'] <= 180:
    		$return['avg_time_score'] = 20;
    	break;
    	case $data['avg_time'] > 180 && $data['avg_time'] <= 240:
    		$return['avg_time_score'] = 30;
    	break;
    	case $data['avg_time'] > 240 && $data['avg_time'] <= 300:
    		$return['avg_time_score'] = 40;
    	break;
    	case $data['avg_time'] > 300:
    		$return['avg_time_score'] = 50;
    	break;
    }

    return $return;
	}

	private function _parseMCData( $data ) {
		$return = array();

		$return['open_rate']           = $this->_calculateOpenRate( $data );
		$return['open_rate_formatted'] = round( $return['open_rate'], 2 );

		return $return;
	}

	private function _calculateOpenRate( $data ) {
		$opened        = $data['unique_opens'];
		$sent          = $data['emails_sent'];
		$bounces       = $data['hard_bounces'] + $data['soft_bounces'];
		$unsubscribes  = $data['unsubscribes'];
		$abuse_reports = $data['abuse_reports'];
		$invalid = $bounces + $unsubscribes + $abuse_reports;

		return ( $opened / ( $sent - $invalid ) ) * 100;
	}

	private function _parseGAData( $data ) {
		$return = array();

		foreach( $data as $key => $value ) {
			switch( $key ) {
				case "ga:uniquePageviews":
					$key = "unique_pageviews";
				break;
				case "ga:avgTimeOnPage":
					$key   = "avg_time";
					$return['avg_time_formatted'] = $this->_toTime( $value );
				break;
			}

			$return[$key] = $value;
		}

		return $return;
	}

	private function _toTime( $secs ) {
		$t = round( $secs );
  	return sprintf('%02d:%02d:%02d', ($t/3600),($t/60%60), $t%60);
	}

	private function _gaConnect() {
		$this->client = new Google_Client();
		$this->client->setApplicationName( $this->config['app_name'] );
		$this->client->setClientId( $this->config['client_id'] );
		$this->client->setAccessType( "offline" );
		$this->client->setClientSecret( $this->config['client_secret'] );
		$this->client->setRedirectUri( $this->config['redirect_uri'] );
		$this->client->setDeveloperKey( $this->config['key'] );
		$this->client->setScopes( array( "https://www.googleapis.com/auth/analytics.readonly" ) );
	}
}

