const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

// const connectDatabase = () => {
//   mongoose.connect(process.env.DB_URI).then((data) => {
//     console.log(`Mongodb connected with server ${data.connection.host}`);
//   });
// };

const connectDatabase = () => {
  mongoose
    .connect(
      "mongodb+srv://datapollex:dpxultra50@datapollex.12ihweq.mongodb.net/DataPollex"
    )
    .then((data) => {
      console.log(`Mongodb connected with server ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
