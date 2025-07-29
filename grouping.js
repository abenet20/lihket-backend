const bcrypt = require("bcrypt");

const generateHash = async (password) => {
    const saltRounds = 10;
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (error) {
        console.error("Error generating hash:", error);
        throw error;
    }
    }

    generateHash("teketel34").then((hash) => {
        console.log("Generated hash:", hash)
        });