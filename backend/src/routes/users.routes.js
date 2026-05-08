import { Router } from "express";
import {addToHistory, getUserHistory, login, register} from "../controllers/user.controller.js";
const router = Router();

router.route("/").get((req, res) => {
    res.send("Users route");
});

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/add_to_activity').post(addToHistory);
router.route('/get_all_activity').get(getUserHistory);
// router.route('/getUser').get(getUser);
// router.route('/updateUser').post(updateUser);

export default router;