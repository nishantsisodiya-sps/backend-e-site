const User = require('../models/user')
const Seller = require('../models/seller')



exports.updateProfile = async (req, res) => {
    try {
        console.log(req.params);
      const { userId, sellerId } = req.params;
  
      if (userId) {
        const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }
        await user.save();
        return res.status(201).json({ msg: "User details updated successfully" });
      }
  
      if (sellerId) {
        const seller = await Seller.findByIdAndUpdate(sellerId, req.body, { new: true });
        if (!seller) {
          return res.status(404).json({ msg: "Seller not found" });
        }
        await seller.save();
        return res.status(201).json({ msg: "Seller details updated successfully" });
      }
  
      return res.status(400).json({ msg: "Please provide either userId or sellerId" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };
  



exports.changePassword = async (req, res) => {
  try {
    const { userId, sellerId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Check if the current password matches
      if (user.password !== currentPassword) {
        return res.status(400).json({ msg: "Incorrect current password" });
      }

      // Update the password
      user.password = newPassword;
      await user.save();

      return res.status(200).json({ msg: "Password changed successfully" });
    }

    if (sellerId) {
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ msg: "Seller not found" });
      }

      // Check if the current password matches
      if (seller.password !== currentPassword) {
        return res.status(400).json({ msg: "Incorrect current password" });
      }

      // Update the password
      seller.password = newPassword;
      await seller.save();

      return res.status(200).json({ msg: "Password changed successfully" });
    }

    return res.status(400).json({ msg: "Please provide either userId or sellerId" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
