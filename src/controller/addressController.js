const Address = require('../models/address')


// exports.createAddress = async (req, res) => {
//     try {
//         const userId = req.user ? req.user._id : req.seller._id;
//       const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone } = req.body;
//       console.log(req.body);
  
//       const address = new Address({
//         userId,
//         fullName,
//         addressLine1,
//         addressLine2,
//         city,
//         state,
//         postalCode,
//         country,
//         phone,
//       });
  
//       await address.save();
//       res.status(201).json({
//         message: "Address created successfully",
//         address: address,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         error: "Server error",
//       });
//     }
//   };




exports.createAddress = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.seller._id;
    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone } = req.body;
    console.log(req.body);

    const address = new Address({
      userId,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: true, // Set the newly created address as default
    });

    // Update any existing default address to not be the default anymore
    await Address.updateMany({ userId: userId, isDefault: true }, { $set: { isDefault: false } });

    await address.save();

    res.status(201).json({
      message: "Address created successfully",
      address: address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
};



  // Get Address by ID
exports.getAddressById = async (req, res) => {
    try {
      const addressId = req.params.id;
      const address = await Address.findById(addressId);
    
  
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
  
      res.status(200).json({
        message: "Address retrieved successfully",
        address: address,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Server error",
      });
    }
  };
  


  // Update Address by ID
exports.updateAddressById = async (req, res) => {
    try {
      const addressId = req.params.id;
      const { fullName, addressLine1, addressLine2, city, state, postalCode, country, phone } = req.body;
  
      const address = await Address.findByIdAndUpdate(
        addressId,
        {
          fullName,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          phone,
        },
        { new: true }
      );
  
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
  
      res.json({
        message: "Address updated",
        address: address,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Server error",
      });
    }
  };

  
  
  // Delete Address by ID
  exports.deleteAddressById = async (req, res) => {
    try {
      const addressId = req.params.id;
      const address = await Address.findByIdAndRemove(addressId);
  
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
  
      res.status(200).json({
        message: "Address Deleted",
        address: address,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Server error",
      });
    }
  };



  exports.getAllAddresses = async (req, res) => {
   
    try {
      const userId = req.user ? req.user._id : req.seller._id;
  
      const addresses = await Address.find({ userId: userId });
  
      res.status(200).json({
        message: "Addresses retrieved successfully",
        addresses: addresses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Server error",
      });
    }
  };




  exports.setDefaultAddress = async (req, res) => {
    try {
      const userId = req.user ? req.user._id : req.seller._id;
      const addressId = req.params.id;
  
      // Update any existing default address to not be the default anymore
      await Address.updateMany({ userId: userId, isDefault: true }, { $set: { isDefault: false } });
  
      // Set the selected address as the new default
      const updatedAddress = await Address.findByIdAndUpdate(addressId, { isDefault: true }, { new: true });
  
      if (!updatedAddress) {
        return res.status(404).json({ error: "Address not found" });
      }
  
      res.json({
        message: "Default address updated",
        address: updatedAddress,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Server error",
      });
    }
  };
  