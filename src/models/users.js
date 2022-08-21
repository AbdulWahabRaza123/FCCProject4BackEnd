const mongoose = require("mongoose");
const UsersSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true
    }
})
const newUser = new mongoose.model("newUser", UsersSchema);
module.exports = newUser;
