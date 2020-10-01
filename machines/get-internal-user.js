const axios = require('axios');

module.exports = {


  friendlyName: 'Get internal User',


  description: 'Get one internal user based on ID',



  cacheable: false,


  sync: false,


  inputs: {
    hostFQDN: {
      example: 'my-ise-host.flintstone.com',
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
    },
    userID: {
      example: '3c95aed6-4975-47af-b623-91405e12a2b4',
      description: 'The user ID',
      required: true
    }
  },


  exits: {

    success: {
      description: 'Returns a user object.',
      example: {
        "id": "5622278c-b002-46cb-a974-20d341d7d4c7",
        "name": "johndoe",
        "description": "Important note!",
        "enabled": true,
        "password": "*******",
        "firstName": "John",
        "lastName": "Doe",
        "changePassword": false,
        "identityGroups": "86e98b60-481f-11ea-8314-005056bcc161",
        "expiryDateEnabled": true,
        "expiryDate": "2021-12-31",
        "enablePassword": "*******",
        "customAttributes": {
            "Company": "Fruits Unlimited",
            "SMSPhone": "+1358407322386",
            "Contact": "Fred@flintstone.com"
        },
        "passwordIDStore": "Internal Users",
        "link": {
            "rel": "self",
            "href": "https://my-ise-host.flintstone.com:9060/ers/config/internaluser/5622278c-b002-46cb-a974-20d341d7d4c7",
            "type": "application/xml"
        }
    }
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
    const data = {}
    const url = `https://${inputs.hostFQDN}:9060/ers/config/internaluser/${inputs.userID}`
    const options = {
      auth: {
        username: inputs.ersUser,
        password: inputs.password
      },
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    };

    axios.get(url, options)
      .then(response => {

        if (response.data.InternalUser != null) {

          return exits.success(response.data.InternalUser)
        }
      })
      .catch(function (error) {
        if (error.response.status == 401) {
          return exits.authFailed(error.response.statusText)
        } else if (error.response.status == 404) {
          return exits.noHits(error.response.statusText)
        } else {
          return exits.error(error)
        }

      })

  }
};