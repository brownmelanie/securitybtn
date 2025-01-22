module.exports = {
    ENV: {
      dev: {
        apiUrl: 'https://software.ansaseguridad.com.ar/secbutton-api'
      },
      prod: {
        apiUrl: 'https://software.ansaseguridad.com.ar/secbutton-api'
      }
    },
    
    getEnvVars: function(env = process.env.NODE_ENV) {
      if (env === 'development') {
        return this.ENV.dev;
      }
      return this.ENV.prod;
    },
  
    API_URL: function() {
      return this.getEnvVars().apiUrl;
    }
  };