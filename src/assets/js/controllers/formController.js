;( function( $ ) {
  "use strict";

  app.controller( "formController", function( $scope, $http ) {
    $scope.gaConnection = false;
    $scope.mcConnection = false;
    $scope.gaURL        = false;

    $scope.form = {
      'viewID'   : localStorage.getItem( "viewID" ) === null ? '' : localStorage.getItem( "viewID" ),
      'mcAPI'    : localStorage.getItem( "mcAPI" ) === null ? '' : localStorage.getItem( "mcAPI" ),
      'path'     : localStorage.getItem( "path" ) === null ? '' : localStorage.getItem( "path" ),
      'mcID'     : localStorage.getItem( "mcID" ) === null ? '' : localStorage.getItem( "mcID" ),
      'startDate': localStorage.getItem( "startDate" ) === null ? startDate : new Date( localStorage.getItem( "startDate" ) ),
      'endDate'  : localStorage.getItem( "endDate" ) === null ? endDate : new Date( localStorage.getItem( "endDate" ) ),
      'type'     : localStorage.getItem( "type" ) === null ? 'retention' : localStorage.getItem( "type" ),
      'category' : localStorage.getItem( "category" ) === null ? '' : localStorage.getItem( "category" ),
      'action'   : localStorage.getItem( "action" ) === null ? '' : localStorage.getItem( "action" ),
      'label'    : localStorage.getItem( "label" ) === null ? '' : localStorage.getItem( "label" )
    };

    $scope.score = {
      open_rate: 0,
      events   : 0,
      pageviews: 0,
      avg_time : 0,
      avg      : 0
    };

    $scope.gaData = {
      pageviews: {
        avg_time_formatted: '0:00:00',
        unique_pageviews  : 0
      },
      events: {
        unique_events: 0
      }
    };
    $scope.mcData = {
      open_rate_formatted: 0
    };

    $scope.errors = {};

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
      if ( typeof( $scope.gaURL ) !== "undefined" ) {
        trackEvent( "Content Score Report", "GA Authorization" );

        window.location.replace( $scope.gaURL );
      }
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
        'type'      : $scope.form.type,
        'path'      : $scope.form.path,
        'startDate' : $scope.form.startDate,
        'endDate'   : $scope.form.endDate,
      };

      // Save fields to localStorage.
      localStorage.setItem( "viewID", $scope.form.viewID );
      localStorage.setItem( "path", $scope.form.path );
      localStorage.setItem( "startDate", $scope.form.startDate );
      localStorage.setItem( "endDate", $scope.form.endDate );

      switch( send.type ) {
        case 'retention':
          send.mcAPI = $scope.form.mcAPI;
          send.mcID  = $scope.form.mcID;

          // Save fields to localStorage.
          localStorage.setItem( "mcAPI", $scope.form.mcAPI );
          localStorage.setItem( "mcID", $scope.form.mcID );

          // Send event to GA.
          trackEvent( "Content Score Report", "Form Submitted", "Retention" );
        break;
        case 'acquisition':
          send.category = $scope.form.category;
          send.action   = $scope.form.action;
          send.label    = $scope.form.label;

          // Save fields to localStorage.
          localStorage.setItem( "category", $scope.form.category );
          localStorage.setItem( "action", $scope.form.action );
          localStorage.setItem( "label", $scope.form.label );

          // Send event to GA.
          trackEvent( "Content Score Report", "Form Submitted", "Acquisition" );
        break;
      }

      console.log( "Submitting form..." );
      _apiCall( send, function( data ) {
        console.log( data );

        $scope.gaData = data.gaData;
        $scope.mcData = data.mcData;

        $scope.score.open_rate = data.score.open_rate;
        $scope.score.pageviews = data.score.pageviews;
        $scope.score.avg_time  = data.score.avg_time;
        $scope.score.events    = data.score.events;

        switch( $scope.form.type ) {
          case "retention":
            $scope.score.avg = ( data.score.open_rate + data.score.pageviews + data.score.avg_time ) / 3;
          break;
          case "acquisition":
            $scope.score.avg = ( data.score.events + data.score.pageviews + data.score.avg_time ) / 3;
          break;
        }
      });
    };

    this.checkConnections();
  });
})( jQuery );
