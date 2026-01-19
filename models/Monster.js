import mongoose from "mongoose";


const monsterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        elementalType: { type: String, required: true },
        elementalWeakness: { type: String, required: true },
    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                ret._links = {
                    self: {
                        href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters/${ret.id}`,
                    },
                    collection: {
                        href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/monsters`
                    },
                };

                delete ret._id;
            },
        },
    }
);



const Monster = mongoose.model("Monster", monsterSchema);

export default Monster;