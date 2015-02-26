module.exports = {
  dev: {
    files: [{
      expand: true,
      cwd: 'src/assets/img/',
      src: ['**/*.{png,jpg,gif,svg}'],
      dest: 'dev/assets/img/'
    }]
  },
  prod: {
    files: [{
      expand: true,
      cwd: 'src/assets/img/',
      src: ['**/*.{png,jpg,gif,svg}'],
      dest: 'dist/assets/img/'
    }]
  }
};