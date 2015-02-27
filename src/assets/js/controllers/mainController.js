;( function( $ ) {
	"use strict";

	app.controller( 'mainController', function( angularLoad ) {

	  /**
	   * Asynchronously loads scripts.
	   *
	   * Loads global CSS & JS scripts and legacy dependent scripts if necessary.
	   */
    angularLoad.loadCSS( '//fonts.googleapis.com/css?family=Lato:300,400,700,400italic' );
	  angularLoad.loadCSS( 'assets/css/style.css' );
	});
})( jQuery );
