const FCM = require("fcm-node");
const serverKey = process.env.FCM_SERVER_KEY;
const admins = require("firebase-admin");
const serviceAccount = require("../../firebase-config.json");
admins.initializeApp({
  credential: admins.credential.cert(serviceAccount),
});
const fcm = new FCM(serverKey);

// Send Notification to the driver using 'OneByOne ALgo'
exports.sendNotification_OneByOne = async (orderDetails , deviceToken) => {
  console.log(deviceToken);
  try {

    const message = {
      to: deviceToken,
      notification: {
        title: "Ecommerce app",
        body: "Hey! You have a new package delivery request",
      },
      data: {
        orderId: orderDetails.id,
        Customer_name: orderDetails.name,
        Amount: orderDetails.amount,
      },
    };
    console.log(message);

    fcm.send(message, (err, response) => {
      if (err) {
        console.error("Error sending notification:", err);
      } else {
        console.log("Notification sent to the driver:", response);
      }

    });
    console.log(fcm);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};



// import express from 'express'
// import bodyparser from 'body-parser'
// import { admin } from './firebase-config'

// const app = express()
// app.use(bodyparser.json())

// const notification_options = {
//     priority: "high",
//     timeToLive: 60 * 60 * 24
//   };

// exports.sendNotification_OneByOne = async(req, res)=>{

//   const  registrationToken = req.body.registrationToken
//   const message = req.body.message
//   const options =  notification_options
  
//     admin.messaging().sendToDevice(registrationToken, message, options)
//     .then( response => {

//      res.status(200).send("Notification sent successfully")
     
//     })
//     .catch( error => {
//         console.log(error);
//     });

// }