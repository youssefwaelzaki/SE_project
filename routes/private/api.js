const { isEmpty } = require("lodash");
const { v4 } = require("uuid");
const db = require("../../connectors/db");
const roles = require("../../constants/roles");
const {getSessionToken}=require('../../utils/session')
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/");
  }
  console.log("hi",sessionToken);
  const Tuser = await db
    .select("*")
    .from("se_project.sessions")
    .where("token", sessionToken)
    .innerJoin(
      "se_project.users",
      "se_project.sessions.userid",
      "se_project.users.id"
    )
    
   
   console.log("Tuser =>",Tuser );
   const user=Tuser[0];

  console.log("user =>", user.roleid);
  user.isNormal = user.roleid === roles.user;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;
  console.log("user =>", user)
  return user;
};

module.exports = function (app) {
  // example
  app.get("/users", async function (req, res) {
    try {
       const user = await getUser(req);
      const users = await db.select('*').from("se_project.users")
        
      return res.status(200).json(users);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get users");
    }
   
  });
 
  app.get("/subscriptions", async function (req, res) {
    try {
      const user = await getUser(req);

      
     

      const subscriptions = await db.select("*")
      .from("se_project.subscription")
      .where("usedid", user.id)

      return res.status(200).json(subscriptions);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not get subscriptions");
    }
  });



  app.post("/subscriptions" ,async function (req, res) {
    const user = await getUser(req);
    creditCardNumber= req.body.creditCardNumber;
    holderName= req.body.holderName;
    payedAmount= req.body.payedAmount;
    
    
      const subscription = {
      nooftickets : 0,
      subtype: req.body.subType,
      
      userid : user.userid,
      zoneid: req.body.zoneId
    
    };

    try {
      const user = await db("se_project.subsription")
        .insert(subscription)
        .returning("*");

      return res.status(200).json(user);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Could not subscribe");
    }
    


  });


app.post("tickets" , async function (req, res){
  const user = await getUser(req);
  creditCardNumber= req.body.creditCardNumber;
  holderName= req.body.holderName;
  payedAmount= req.body.payedAmount;
  
  
    const ticket = {
    origin :req.body.origin,
    destination: req.body.destination,
    
    userid : user.userid,
    tripDate: req.body.tripDate
  
  };

  try {
    const user = await db("se_project.tickets")
      .insert(ticket)
      .returning("*");

    return res.status(200).json(user);
  } catch (e) {
    console.log(e.message);
    return res.status(400).send("Could not but ticket");
  }

});




  
};
