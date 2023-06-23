const FCM = require("fcm-node");
const serverKey = process.env.FCM_SERVER_KEY;
const admins = require("firebase-admin");
const serviceAccount = require("../../firebase-config.json");
admins.initializeApp({
  credential: admins.credential.cert(serviceAccount),
});
const fcm = new FCM(serverKey);

// Send Notification to the driver using 'OneByOne ALgo'
exports.sendNotification_OneByOne = async (orderDetails) => {
    console.log(orderDetails);
  try {
    const deviceToken = "DEVICE_TOKEN";

    const message = {
      to: deviceToken,
      notification: {
        title: "Ecommerce app",
        body: "Hey! ABC wants to deliver a package",
      },
      data: {
        orderId: orderDetails.id,
        Customer_name: orderDetails.name,
        Amount: orderDetails.amount,
      },
    };

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
