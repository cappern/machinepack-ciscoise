const axios = require('axios');



module.exports = {


  friendlyName: 'Get Internal Users',


  description: 'Gets all the internal users',


  cacheable: false,


  sync: false,


  inputs: {
    hostFQDN: {
      example: 'my-ise-host.company.com',
      description: 'The fqdn or IP-address of your Cisco ISE admin host.',
      required: true
    },
    ersUser: {
      example: 'admin',
      description: 'ERS user.',
      required: true
    },
    password: {
      example: 'some safe password!',
      description: 'Your Cisco ISE ERS password.',
      required: true
    }
  },


  exits: {

    success: {
      description: 'Returns a user array.',
      example: []
    },
    error: {
      description: 'Unexpected error occurred.',
    },
    authFailed: {
      description: 'Wrong Username or password.',
    },
    noHits: {
      description: 'No user matches your search.',
    },

  },


  fn: function (inputs, exits) {
    const data = []
    const url = `https://${inputs.hostFQDN}:9060/ers/config/internaluser?filter=identityGroup.EQ.EXT-NR`
    const options = {
      auth: {
        username: inputs.ersUser,
        password: inputs.password
      },
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    };

    async function ExecuteRequest(url) {


      // As this is a recursive function, we need to be able to pass it the prevous data. Here we either used the passed in data, or we create a new objet to hold our data.


      await axios.get(url, options)
        .then(response => {

          if (response.data.SearchResult.resources != null) {

            response.data.SearchResult.resources.forEach(user => {
              data.push(user)
            });
          }



          // We check if there is more paginated data to be obtained
          if (response.data.SearchResult.nextPage != null) {
            console.log(`Fetching ${response.data.SearchResult.nextPage.href}`)

            // If nextPageUrl is not null, we have more data to grab
            return ExecuteRequest(response.data.SearchResult.nextPage.href);
          } else {
            return exits.success(data)
          }
        })
        .catch(function (error) {
          if (error.response.status == 401) {
            return exits.authFailed(error.response.statusText)
          } else {
            return exits.error(error)
          }

        })


    }

    ExecuteRequest(url, options)

  },



};