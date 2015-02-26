module.exports = {
  dev: {
    files: [
    	{expand: true, cwd: 'src/lib/', src: ['**', '!config.sample.php'], dest: 'dev/lib/'},
    	{expand: true, cwd: 'src/assets/font/', src: ['**'], dest: 'dev/assets/font/'},
    ]
  },
  prod: {
    files: [
    	{expand: true, cwd: 'src/lib/', src: ['**', '!config.sample.php'], dest: 'dist/lib/'},
    	{expand: true, cwd: 'src/assets/font/', src: ['**'], dest: 'dist/assets/font/'},
    ]
  }
};