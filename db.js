const Grid = require("gridfs-stream");
const mongoose = require("mongoose");

let gfs;

const conn = mongoose.connection;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is fully ready...");
  })
  .catch((err) => {
    console.log(err);
  });

conn.on("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

module.exports = { conn, gfs, mongoose };
