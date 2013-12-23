# Overview

Development status: active development, alpha

The purpose of this library is to help manage your RESTful endpoints for Restify. One of the biggest challenges to creating and maintaining and API service is it's documentation, Restify Endpoints tries to help solve this problem by allowing you to auto-generate documentation based on all your defined code. Instead of writing documentation separately, write it while you code, in your code.


# Roadmap / Brainstorming

* Auto-generate Docs - Support more then markdown format as export.
* Endpoint Middleware Support - better support for additional plugins/middleware that can be used against the endpoints?


# Installation

## package.json

```
{
  "dependencies": {
    "restify-endpoints": "git+https://github.com/ekristen/restify-endpoints.git"
  }
}
```

## npm install

```
npm install git+https://github.com/ekristen/restify-endpoints.git
```

# Credits / Thanks
A special thanks to https://github.com/robertklep for helping me visualize how to build the project and for the first iteration of the endpoints manager class.