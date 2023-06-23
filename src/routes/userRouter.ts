import { Request, Response, Router } from "express";
import { User, UserNotFound } from "../services/users/User";
import { validate } from "../utiils";
import { userUpdateSchema } from "../services/users/UserSchema";
import { userSchema } from "../services/users/UserSchema";
import {z} from 'zod';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
     const {body} = req;
     try {
          const sanitizedInput = await validate(userSchema, body);
          const user = await User.insert(sanitizedInput);
          res.send(user);
     } catch (error) {
          if (error instanceof z.ZodError) {
               return res.status(400).send(error.flatten().fieldErrors)
          }
     }
});

router.get('/', async (req: Request, res: Response) => {
     try {
          const {user_id} = req.body;
          const user = User.get(user_id);
          res.send(user);     
     } catch (error) {
          if (error instanceof UserNotFound) {
               res.status(404).send({error: "User not found"});
          }
          else {
               res.status(400).send(error);
          }
     }
     
});

router.patch('/', async (req: Request, res: Response) => {
     const {body} = req;
     try {
          const sanitizedInput = await validate(userUpdateSchema, body);
          const user = await User.update(1, sanitizedInput);
          if (!user) {
               return res.status(404).send({error: "User not found"});
          }
          res.status(200).send(user);
     } catch (error) {
          if (error instanceof z.ZodError) {
               return res.status(400).send(error.flatten().fieldErrors)
          }
     }
})

export default router;
