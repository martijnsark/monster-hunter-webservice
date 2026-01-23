import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// hard-coded credentials
const USERNAME = "admin";
const PASSWORD = "admin123";

router.post("/login", (req, res) => {
    //read the authorization header from request
    const authHeader = req.headers.authorization;

    //if no auth header or wrong auth header
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        //tells the client which auth scheme is required
        res.setHeader("WWW-Authenticate", 'Basic realm="Login"');
        return res.status(401).json({ error: "Authorization header missing" });
    }

    //removes basic when decoding base64
    const base64Credentials = authHeader.split(" ")[1];
    //decodes the Base64 string into readable text.
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
    //separates password and username
    const [username, password] = credentials.split(":");

    //check login credentials
    if (username !== USERNAME || password !== PASSWORD) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    //create JWT token
    const token = jwt.sign(
        { username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    //add 200 status
    res.status(200).json({ token });
});

export default router;
