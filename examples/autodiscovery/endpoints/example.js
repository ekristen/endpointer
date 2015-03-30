var data = {
  '1': {'data': 'cool', 'example': 'four'},
  '2': {'data': 'something', 'another': 'example'}
};

module.exports = {
  name: 'Example',
  description: 'Example Endpoints',
  endpoints: [
    {
      name: 'Example',
      description: 'Default Example Endpoint',
      method: 'GET',
      auth: false,
      path: '/example',
      version: '1.0.0',
      handler: function (req, res, next) {
        res.send({"status": "ok", "message": "Example Default Endpoint"});
        return next();
      }
    },
    {
      name: 'getExample',
      description: 'Get Example Data Endpoint',
      method: 'GET',
      auth: false,
      path: '/example/:id',
      version: '1.0.0',
      params: {
        id: {
          required: true,
          type: 'number',
          description: 'the example id of the endpoint'
        }
      },
      handler: function (req, res, next) {
        res.send(data[req.params.id]);
        return next();
      }
    },
    {
      name: 'deleteExample',
      description: 'Delete Example Data for all Endpoints',
      method: 'DELETE',
      auth: false,
      path: '/example/:id',
      version: '1.0.0',
      params: {
        id: {
          required: true,
          type: 'string',
          description: 'the id of the endpoint'
        }
      },
      handler: function (req, res, next) {
        res.send(data[req.params.id]);
        return next();
      }
    }
  ]
}
