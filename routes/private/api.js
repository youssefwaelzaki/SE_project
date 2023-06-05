
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


app.post("/tickets" , async function (req, res){
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

app.post("/tickets/subscription" , async function (req, res){
  const user = await getUser(req);
    subscription=await db.select("*")
    .from("se_project.tickets")
    .where("id", req.body.subId)
  
  
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
    return res.status(400).send("Could not buy ticket");
  }

});


app.post("/api/v1/refund/:ticketId", async function (req, res) {
  const user = await getUser(req);
  const ticketId = req.params.ticketId;

  try {
    const ticket = await db("se_project.tickets")
      .where("id", ticketId)
      .where("userid", user.id)
      .where("tripdate", ">", new Date())
      .first();

    if (!ticket) {
      return res.status(404).send("Ticket not found ");
    }

    
    await db("se_project.tickets").where("id", ticketId).del();

    
    if (ticket.subid) {
     
      await db("se_project.subscription")
        .where("id", ticket.subid)
        .decrement("nooftickets", 1);
    } else {
      
      
      const transaction = {
        ticketid: ticket.id,
        userid: user.id,
        amount: ticket.payedAmount,
        status: "pending",
        refundDate: new Date(),
      };

      await db("se_project.transactions").insert(transaction);
    }

    return res.status(200).send("Ticket refunded successfully");
  } catch (e) {
    console.log(e.message);
    return res.status(400).send("Failed to process refund");
  }
});




app.get("/api/v1/tickets/price/:originId&:destinationId", async function (req, res) {
  const originId = req.params.originId;
  const destinationId = req.params.destinationId;

  try {
    
    const prices = await db("se_project.prices")
      .where("originId", originId)
      .where("destinationId", destinationId)
      .first();

    if (!prices) {
      return res.status(404).send("Prices not found");
    }

    return res.status(200).json(prices);
  } catch (e) {
    console.log(e.message);
    return res.status(400).send("Failed");
  }
});





app.post("/api/v1/senior/request", async function (req, res) {
  const { nationalId } = req.body;

  try {


    if (!user) {
      return res.status(404).send("User not found");
    }

    
    const existingRequest = await db("se_project.senior_requests")
      .where("userid", user.id)
      .first();

    if (existingRequest) {
      return res.status(400).send("Senior request already exists");
    }

    
    const newRequest = {
      status: "Pending",
      userid: user.id,
      nationalid: nationalId
    };

    
  } catch (e) {
    console.log(e.message);
    return res.status(400).send("Failed to request senior");
  }
});







  
};
