var scripts = [
    'src/assets/js/lib/jquery/jquery-2.1.3.js',
    'src/assets/js/lib/angular/angular.js',
    'src/assets/js/lib/angular/loading-bar.js',
    'src/assets/js/lib/angular/angular-load.js',
    'src/assets/js/config.js',
    'src/assets/js/controllers/mainController.js',
    'src/assets/js/controllers/formController.js',
];

module.exports = {
  dev: {
    options: {
      beautify: true,
      mangle: false,
      compress: false
    },
    files: {
       'dev/assets/js/app.js': scripts,
    }
  },
  prod: {
  	options: {
  		mangle: false
  	},
    files: {
    	'dist/assets/js/app.js': scripts,
    }
  }
};
