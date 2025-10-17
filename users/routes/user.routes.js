import { Router } from "express";
import { getUserById, getAllUsers, createUser, updateUser, changeAuthLevel } from "../services/dataAccessServicesUser.service.js";
import registerValidationSchema from "../validations/registerValidationSchema.js";
import loginValidationSchema from "../validations/loginValidationSchema.js";
import User from "../models/user.schema.js";
import { comparePassword, hashPassword } from "../services/password.service.js";
import { generateToken } from "../../services/auth.service.js";
import { auth } from "../../middlewares/auth.js";
import { adminOnly, adminOrUser, userOnly, adminOrManagerOnly } from "../../middlewares/userAuthentication.js";
import { io } from "../../server.js";
import updateUserValidation from "../validations/updateUserValidation.Schema.js";



const userRouter = Router();

// getting all the users (only for admin)
userRouter.get("/", auth, adminOnly, async (req, res) => {
    try {
        const users = await getAllUsers();

        if (users.length === 0) {
            return res.json([]);
        }
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// getting the logged in user (only for registered users)
userRouter.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);

    } catch (err) {
        res.status(500).send(err.message);
    }


});

// get all the user's workers
userRouter.get("/myworkers", auth, adminOrManagerOnly, async (req, res) => {
    try {
        const managerId = req.user._id;
        const workers = await User.find({ managerId }).select("-password");

        if (workers.length === 0) {
            return res.json([]);
        }

        res.json(workers);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// getting a user by his id (registerd user or admin)
userRouter.get("/:id", auth, adminOrUser, async (req, res) => {
    try {
        const userId = req.params.id;

        const userById = await getUserById(userId);
        return res.json(userById);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// register a new user / add a new user to the database
userRouter.post("/register", async (req, res) => {
    const { error } = registerValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((p) => p.message) });
    }

    try {
        const data = req.body;
        data.password = await hashPassword(data.password);
        const newUser = await createUser(data);

        res.json({ message: "User added successfully", newUser });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});



// add a worker (only for admin or manager)
userRouter.post("/addworker", auth, adminOrManagerOnly, async (req, res) => {
    const { error } = registerValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((p) => p.message) });
    }

    try {
        const data = req.body;
        data.password = await hashPassword(data.password);
        data.managerId = req.user._id;

        const newUser = await createUser(data);

        res.json({ message: "User added successfully", newUser });

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// login a user
userRouter.post("/login", async (req, res) => {

    const { error } = loginValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((p) => p.message) });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("Invalid credentials");
        }

        const isPasswordCorrect = await comparePassword(password, user.password);

        if (!isPasswordCorrect) {
            res.status(401).send("Invalid password");
        }

        const token = generateToken(user);
        return res.send(token);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

// updating a user by his id (the registered user only)
userRouter.put("/:id", auth, userOnly, async (req, res) => {

    const { error } = updateUserValidation.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ errors: error.details.map((p) => p.message) });
    }

    try {
        const data = req.body;
        const id = req.params.id;

        const user = await updateUser(id, data);

        try {
            io.emit("User updated", user);
        } catch (err) {
            console.error(`websoket err: ${err}`);
        }


        return res.json({ message: "User updated", user });

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// deleting a user by his id (only the manager or admin)
userRouter.delete("/:id", auth, adminOrManagerOnly, async (req, res) => {

    const id = req.params.id;

    try {
        const user = await getUserById(id);
        if (user.isAdmin) {
            return;
        }
        res.json({ message: "User Deleted", user });
        await User.findByIdAndDelete(user._id);

        try {
            io.emit("User deleted", user);
        } catch (err) {
            console.error(`websoket err: ${err}`);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// changing the user's authentication level (only the manager or admin)
userRouter.patch("/:id", auth, adminOrManagerOnly, async (req, res) => {
    try {
        const user = await changeAuthLevel(req.params.id);
        res.json({ message: "Manager Status changed to " + user.isManager, user });

        try {
            io.emit("Manager status updated", user);
        } catch (err) {
            console.error(`websoket err: ${err}`);
        }
    } catch (err) {
        res.status(400).send(err.message);
    }
});

export default userRouter;