module.exports = {
  dev: {
    options: {
    	config: 'config.rb'
    }
  },
  prod: {
    options: {
      config: 'config.rb',
      environment: 'production'
    }
  }
};