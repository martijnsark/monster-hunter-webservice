import express from "express";
import { faker } from '@faker-js/faker';
import Monster from "../models/Monster.js";
import jwt from "jsonwebtoken";



const router = express.Router();


router.use((req, res, next) => {
    // Allow any origin
    res.header('Access-Control-Allow-Origin', '*');

    next();
});

router.options('/', (req, res) => {
    res.header('Allow', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    //204 no content
    res.sendStatus(204);
});

router.options('/:id', (req, res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    //204 no content
    res.sendStatus(204);
});

router.options('/named/:name', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});



// seed monsters into DB
router.post('/seed', async (req, res) => {
    try {
        //read the authorization header from request
        const authHeader = req.headers.authorization;

        //if no auth header or wrong auth header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.setHeader(
                "WWW-Authenticate",
                'Bearer realm="access"'
            );
            //401 unauthorized
            return res.status(401).json({ error: "JWT missing" });
        }

        //removes bearer when token is read
        const token = authHeader.split(" ")[1];

        try {
            //verify and save token
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            res.setHeader(
                "WWW-Authenticate",
                'Bearer realm="access", error="invalid_token"'
            );
            //401 unauthorized
            return res.status(401).json({ error: "Invalid or expired JWT" });
        }

        //wipe monsters before seeding
        await Monster.deleteMany({});

        const createdMonsters = [];

        for (let i = 0; i < req.body.amount ?? 5; i++) {
            const newMonster = await Monster.create({
                name: faker.company.catchPhrase(),
                description: faker.lorem.sentences(2),
                elementalType: faker.lorem.sentence(),
                elementalWeakness: faker.lorem.sentence(),
                image: faker.image.url(),
            });

            createdMonsters.push(newMonster);
        }
        //201 created
        res.status(201).json(createdMonsters);
    } catch (e) {
        //400 bad request
        res.status(400).json();
        console.log(e);
    }
});

// post a Monster
router.post('/', async (req, res) => {
    try {
        const monster = await Monster.create({
            name: req.body.name,
            description:  req.body.description,
            elementalType:  req.body.elementalType,
            elementalWeakness:  req.body.elementalWeakness,
            image: req.body.image,
        });
        //201 created
        res.status(201).json(monster);
    } catch (e) {
        //400 bad request
        res.status(400).json();
        console.log(e);
    }
});



// get all monsters
router.get('/', async (req, res) => {
    try {
        const monsters = await Monster.find();

        const items = monsters.map(monster => ({
            id: monster.id,
            name: monster.name,
            description: monster.description,
            elementalType: monster.elementalType,
            image: monster.image,
            _links: {
                self: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters/${monster.id}`
                },
                collection: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters`
                }
            }
        }));

        //200 oke (success)
        res.status(200).json({
            items,
            _links: {
                self: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters`
                },
                collection: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters`
                }
            }
        });
    } catch (e) {
        //500 internal server error
        res.status(500).json();
        console.log(e);
    }
});



// GET one monster
router.get('/:id', async (req, res) => {
    try {
        const monster = await Monster.findById(req.params.id);

        if (!monster) {
            //404 not found
            return res.status(404).json({ message: "Monster not found" });
        }

        //200 oke (success)
        res.status(200).json(monster);
    } catch (e) {
        //500 internal server error
        res.status(500).json();
        console.log(e);
    }
});

// edit a monster
router.put('/:id', async (req, res) => {
    try {
        const monster = await Monster.findById(req.params.id);

        if (!monster) {
            //404 not found
            return res.status(404).json({ message: "Monster not found" });
        }

        // update only the fields that exist in the request body
        if (req.body.name !== undefined) monster.name = req.body.name;
        if (req.body.description !== undefined) monster.description = req.body.description;
        if (req.body.elementalType !== undefined) monster.elementalType = req.body.elementalType;
        if (req.body.elementalWeakness !== undefined) monster.elementalWeakness = req.body.elementalWeakness;
        if (req.body.image !== undefined) monster.image = req.body.image;

        // save the updated monster
        await monster.save();

        //200 oke (success)
        res.status(200).json(monster);
    } catch (e) {
        //500 internal server error
        res.status(500).json();
        console.log(e);
    }
});


// delete a monster
router.delete('/:id', async (req, res) => {
    try {
        const monster = await Monster.findByIdAndDelete(req.params.id);

        if (!monster) {
            //404 not found
            return res.status(404).json({ message: "Monster not found" });
        }

        //204 no content
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        //500 internal server error
        res.status(500).send();
    }
});

// GET one monster by name
router.get('/named/:name', async (req, res) => {
    try {
        //read the authorization header from request
        const authHeader = req.headers.authorization;

        //if no auth header or wrong auth header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.setHeader(
                "WWW-Authenticate",
                'Bearer realm="access"'
            );
            //401 unauthorized
            return res.status(401).json({ error: "JWT missing" });
        }

        //removes bearer when token is read
        const token = authHeader.split(" ")[1];

        try {
            //verify and save token
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            res.setHeader(
                "WWW-Authenticate",
                'Bearer realm="access", error="invalid_token"'
            );
            //401 unauthorized
            return res.status(401).json({ error: "Invalid or expired JWT" });
        }

        const monster = await Monster.findOne({ name: req.params.name });


        if (!monster) {
            return res.status(404).json({ message: "Monster not found" });
        }


        //200 oke (success)
        res.status(200).json(monster);
    } catch (e) {
        console.error(e);
        //500 internal server error
        res.status(500).json({ message: "Server error" });
    }
});




export default router;