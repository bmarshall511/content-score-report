module.exports = {
    clean: {
      command: [
        'rm -rf dist/*',
        'rm -rf dev/*',
      ].join('&&')
    }
};