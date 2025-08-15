const express = require('express');
const app = express();
const port = 3000;

// Example for a page that embeds an iframe
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parent Page</title>
    </head>
    <body>
        <h1>Parent Page</h1>
        <p>This page embeds an iframe with strict CSP.</p>
        <iframe src="/iframe-content" width="600" height="400" sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"></iframe>
        <p>
          Note: The <code>sandbox</code> attribute further restricts the iframe.
          <code>allow-scripts</code> is needed for the iframe's own JavaScript to run.
        </p>
    </body>
    </html>
  `);
});

// Route for the iframe content with strict CSP headers
app.get('/iframe-content', (req, res) => {
  // Option 1: Set CSP via HTTP Header (Recommended for strict policies)
  // This header tells the browser what resources are allowed for this specific response.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'nonce-randomstring123'; style-src 'self'; img-src 'self'; object-src 'none'; media-src 'none'; frame-ancestors 'none'; form-action 'self';"
  );

  // Option 2: CSP via HTML <meta> tag (Less secure in some scenarios, but works)
  // This is typically used when you don't have control over the server headers.
  // The nonce value here would need to be dynamically generated on the server for security.

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Iframe Content</title>
        <!-- CSP via Meta Tag (less secure for dynamic nonces) -->
        <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self';"> -->
        <style>
            body { font-family: sans-serif; background-color: #f0f0f0; padding: 20px; }
            h2 { color: #333; }
        </style>
    </head>
    <body>
        <h2>Hello from the Iframe!</h2>
        <p>This content is served with a strict Content Security Policy.</p>
        <script nonce="randomstring123">
            // This script will execute because it has the correct nonce.
            console.log("Iframe script executed!");
            document.body.style.backgroundColor = 'lightblue';
        </script>
        <script>
            // This script might be blocked by CSP if no nonce is provided and 'unsafe-inline' is not allowed.
            // In our current strict CSP, this will be blocked if it doesn't have the correct nonce.
            try {
                // This will likely throw an error in the console due to CSP
                // document.getElementById('test').innerText = "This text was modified by a blocked script.";
            } catch (e) {
                console.error("Attempted to run blocked script:", e.message);
            }
        </script>
        <img src="valid_image.png" alt="Valid Image" onerror="console.log('Image failed to load - CSP might be blocking it if source is not self.');">
        <p id="test">Some initial text.</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log("Visit http://localhost:3000 in your browser.");
}); 