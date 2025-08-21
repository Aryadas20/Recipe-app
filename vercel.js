{
  "version" : 2,
  "builds": [
    {
      // Build the backend serverless function
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      // Build the frontend React app
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "rewrites" [
    {
      // Route all API requests to the backend function
      "source": "/api/(.*)",
      "destination": "/backend/server.js"
    },
    {
      // Route all other requests to the React app
      "source": "/(.*)",
      "destination": "/frontend/build/index.html"
    }
  ]
}