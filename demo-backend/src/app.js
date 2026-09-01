const express = require("express");
const logger = require("./logger");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Demo backend is running",
  });
});

app.get("/users/:id", (req, res) => {
  try {
    const user = null;

    // INTENTIONAL BUG
    const name = user.name;

    res.json({
      id: req.params.id,
      name,
    });
  } catch (error) {
    logger.error("Request failed", {
      error: error.message,
      stack: error.stack,
      path: req.originalUrl,
      method: req.method,
    });

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  logger.info("Demo backend started", {
    port: PORT,
  });
});
