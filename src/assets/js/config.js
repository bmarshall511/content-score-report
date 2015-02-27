var app = angular.module( 'content-score-report', [
	'angular-loading-bar',
	'angularLoad'
]);

var scores = {
  retention: {}
};

 var startDate = new Date(),
     endDate = new Date();

startDate.setFullYear( endDate.getFullYear() - 1 );

function trackEvent( category, action, label ) {
	var send = {
		"hitType"      : "event",
		"eventCategory": category,
		"eventAction"  : action
	};

	if( typeof label !== 'undefined') send.eventLabel = label;

	ga( "send", send );
}

function outboundLink( url ) {console.log( url );
	trackEvent( "Outbound", "Click", url );
}

( function( $ ) {
	"use strict";

	$( window ).load( function() {
		console.log( "Loading complete." );
  	$( ".loading" ).fadeOut( function() {
  		$( this ).remove();
  	});
  });

  $( function() {
  	$( "a[target='_blank']" ).click( function() {
  		var url = $( this ).attr( "href" );
  		outboundLink( url );
  	});
  });
})( jQuery );
