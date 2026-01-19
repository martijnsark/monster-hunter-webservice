import express from "express";
import { faker } from '@faker-js/faker';
import Monster from "../models/Monster.js";


const router = express.Router();


router.use((req, res, next) => {
    // Allow any origin (or replace '*' with your frontend URL)
    res.header('Access-Control-Allow-Origin', '*');

    next();
});

router.options('/', (req, res) => {
    res.header('Allow', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});

router.options('/:id', (req, res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
});



// seed monsters into DB
router.post('/seed', async (req, res) => {
    try {
        // wipe spots before seeding
        await Monster.deleteMany({});

        const createdMonsters = [];

        for (let i = 0; i < req.body.amount; i++) {
            const newMonster = await Monster.create({
                name: faker.company.catchPhrase(),
                description: faker.lorem.sentences(2),
                elementalType: faker.lorem.sentence(),
                elementalWeakness: faker.lorem.sentence(),
            });

            createdMonsters.push(newMonster);
        }

        res.status(201).json(createdMonsters);
    } catch (e) {
        res.status(500).json();
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
        });
        res.status(201).json(monster);
    } catch (e) {
        res.status(500).json();
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
            _links: {
                self: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters/${monster.id}`
                },
                collection: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters`
                }
            }
        }));

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
        res.status(500).json();
        console.log(e);
    }
});



// GET one monster
router.get('/:id', async (req, res) => {
    try {
        const monster = await Monster.findById(req.params.id);

        if (!monster) {
            return res.status(404).json({ message: "Monster not found" });
        }

        res.status(200).json(monster);
    } catch (e) {
        res.status(500).json();
        console.log(e);
    }
});

// edit a monster
router.put('/:id', async (req, res) => {
    try {
        const monster = await Monster.findById(req.params.id);

        if (!monster) {
            return res.status(404).json({ message: "Monster not found" });
        }

        // update only the fields that exist in the request body
        if (req.body.name !== undefined) monster.name = req.body.name;
        if (req.body.description !== undefined) monster.description = req.body.description;
        if (req.body.elementalType !== undefined) monster.elementalType = req.body.elementalType;
        if (req.body.elementalWeakness !== undefined) monster.elementalWeakness = req.body.elementalWeakness;

        // save the updated spot
        await monster.save();

        res.status(200).json(monster);
    } catch (e) {
        res.status(500).json();
        console.log(e);
    }
});


// delete a monster
router.delete('/:id', async (req, res) => {
    try {
        const monster = await Monster.findByIdAndDelete(req.params.id);

        if (!monster) {
            return res.status(404).json({ message: "Monster not found" });
        }

        return res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).send();
    }
});




export default router;