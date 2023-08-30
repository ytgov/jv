import { NextFunction, Request, Response } from "express";
// import axios from "axios";
import { UserService } from "../services";



export async function loadUser(req: Request, res: Response, next: NextFunction) {
  const db = new UserService();
  const email = req.user?.email;
  
  let u = null
  if(email) 
    u = await db.getByEmail(email)

  if (u) {
    u.display_name = `${u.first_name} ${u.last_name}`;
    u.roles = u.roles.split(',');
    req.user = {
      ...req.user,
      ...u
    };
    return next();
  }

  // await axios
  //   .get(`${AUTH0_DOMAIN}userinfo`, {
  //     headers: {
  //       authorization: token
  //     }
  //   })
  //   .then(async resp => {
  //     if (resp.data && resp.data.sub) {
  //       let email = resp.data.email;
  //       let first_name = resp.data.given_name;
  //       let last_name = resp.data.family_name;

  //       email = resp.data.email;

  //       let u = await db.getBySub(sub);

  //       if (u) {
  //         u.display_name = `${u.first_name} ${u.last_name}`;
  //         req.user = {
  //           ...req.user,
  //           ...u
  //         };
  //       } else {
  //         if (!email) email = `${first_name}.${last_name}@yukon-no-email.ca`;

  //         let eu = await db.getBySub(sub);

  //         if (eu) {
  //           eu.display_name = `${eu.first_name} ${eu.last_name}`;
  //           eu.sub = sub;
  //           // await db.update(eu._id || new ObjectId(), eu);

  //           // console.log("UPDATE USER SUB " + email, sub, u);
  //           req.user = {
  //             ...req.user,
  //             ...eu
  //           };
  //         } else {
  //           u = await db.create(sub, email, first_name, last_name, "User", "Active");
            
  //           console.log("CREATING USER FOR " + email, u);
  //           req.user = {
  //             ...req.user,
  //             ...u
  //           };
  //         }
  //       }
  //     } else {
  //       console.log("Payload from Auth0 is strange or failed for", req.user);
  //     }

  //     next();
  //   })
  //   .catch(err => {
  //     console.log("ERROR pulling userinfo from Auth0", err);
  //   });
}
