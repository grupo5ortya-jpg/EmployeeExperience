//const { User } = require("../db");

const getAllUsers = async () => {
    try {
        const allUsers = await User.findAll();
        // const allUsersWithFunction = await 
        return allUsers
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
module.exports = { getAllUsers };