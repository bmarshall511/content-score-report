;( function( $ ) {
  "use strict";

  app.controller( "formController", function( $scope, $http ) {
    $scope.gaConnection = false;
    $scope.mcConnection = false;
    $scope.gaURL        = false;

    $scope.form = {
      'viewID'   : localStorage.getItem( "viewID" ) == 'null' ? '' : localStorage.getItem( "viewID" ),
      'mcAPI'    : localStorage.getItem( "mcAPI" ) == 'null' ? '' : localStorage.getItem( "mcAPI" ),
      'path'     : localStorage.getItem( "path" ) == 'null' ? '' : localStorage.getItem( "path" ),
      'mcID'     : localStorage.getItem( "mcID" ) == 'null' ? '' : localStorage.getItem( "mcID" ),
      'startDate': localStorage.getItem( "startDate" ) == 'null' ? '' : localStorage.getItem( "startDate" ),
      'endDate'  : localStorage.getItem( "endDate" ) == 'null' ? '' : localStorage.getItem( "endDate" )
    };

    $scope.retention = {
      open_rate_score: 0,
      pageviews_score: 0,
      avg_time_score : 0,
      avg_score      : 0
    };

    $scope.gaData = {
    	avg_time_formatted : '0:00:00',
    	unique_pageviews   : 0
    };
    $scope.mcData = {
    	open_rate_formatted: 0
    };

    $scope.errors = {};
    $scope.tip = 1;

    function _apiCall( send, callback ) {
      $http({
        method:  "POST",
        url:     "lib/api.php",
        data:    $.param( send ),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }).success( function( data ) {
      	$scope.errors = data.errors;
        callback( data );
      });
    }

    this.connect = function() {
    	trackEvent( "Content Score Report", "GA Authorization" );

      window.location.replace( $scope.gaURL );
    };

    // Deauthorizes the Google account.
    this.deauthorize = function() {
      var send = {
        'method': 'deauthorize'
      };

      trackEvent( "Content Score Report", "GA Deauthorization" );

      console.log( "Deauthorizing account..." );
      _apiCall( send, function( data ) {
        console.log( data );
        $scope.gaConnection = data.gaConnection;
        $scope.mcConnection = data.mcConnection;
        $scope.gaURL = data.gaURL;
      });
    };

    // Checks if a user is connected to the Google API & MailChimp API.
    this.checkConnections = function() {
      var send = {
        'method': 'checkConnections'
      };

      console.log( "Checking connections..." );
      _apiCall( send, function( data ) {
        console.log( data );
        $scope.gaConnection = data.gaConnection;
        $scope.mcConnection = data.mcConnection;
        $scope.gaURL = data.gaURL;
      });
    };

    // Submits the form.
    this.submit = function() {
      var send = {
        'method'    : 'submitForm',
        'viewID'    : $scope.form.viewID,
        'mcAPI'     : $scope.form.mcAPI,
        'path'      : $scope.form.path,
        'mcID'      : $scope.form.mcID,
        'startDate' : $scope.form.startDate,
        'endDate'   : $scope.form.endDate,
      };

      trackEvent( "Content Score Report", "Form Submitted", "Retention" );

      localStorage.setItem( "viewID", $scope.form.viewID );
      localStorage.setItem( "mcAPI", $scope.form.mcAPI );
      localStorage.setItem( "path", $scope.form.path );
      localStorage.setItem( "startDate", $scope.form.startDate );
      localStorage.setItem( "endDate", $scope.form.endDate );
      localStorage.setItem( "mcID", $scope.form.mcID );

      console.log( "Submitting form..." );
      _apiCall( send, function( data ) {
        console.log( data );

        $scope.gaData = data.gaData;
        $scope.mcData = data.mcData;

        $scope.retention.open_rate_score = data.retention_score.open_rate_score;
        $scope.retention.pageviews_score = data.retention_score.pageviews_score;
        $scope.retention.avg_time_score  = data.retention_score.avg_time_score;
        $scope.retention.avg_score       = ( data.retention_score.open_rate_score + data.retention_score.pageviews_score + data.retention_score.avg_time_score ) / 3;
      });
    };

    this.checkConnections();
  });
})( jQuery );
