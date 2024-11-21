const helmet = require('helmet');   
const compression = require('compression');
const express = require("express");
const path = require("path");

module.exports = function(app) {
    // Serve React static files in production
    if (process.env.NODE_ENV === "production") {
        const clientBuildPath = path.join(__dirname, "../../client/build");
        app.use(express.static(clientBuildPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(clientBuildPath, "index.html"));
        });
    }
    app.use(helmet());
    app.use(compression());

}