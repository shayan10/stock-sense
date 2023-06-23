import {Request, Response, NextFunction} from 'express';
import { tokenService } from '../services/authentication/auth';
import { TokenVerificationError } from '../services/authentication/TokenService';


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const {authorization} = req.headers;

          const userId = authorization ? await tokenService.verifyAccessToken(authorization) : undefined;  
          
          req.body["user_id"] = userId;
          next()

     } catch (error) {
          // Handle any errors that occur during the middleware execution
          console.log(error);
          if (error instanceof TokenVerificationError) {
               res.status(401).send({message: "Invalid Token"})
          } else {
               res.status(500).send({
                    message: "Internal Server Error",
               });    
          }
     }
};

