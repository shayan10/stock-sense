import * as dotenv from 'dotenv';

import {app} from './app';
import { connect } from './db/Postgres';
import {redisConnect} from './db/Redis';

dotenv.config();

Promise.all([redisConnect(), connect()]).then(() => {
     app().listen(process.env.PORT, ()=> {
          console.log(`Server started on port ${process.env.PORT}`)
     });
}).catch((error)=> console.log(error));