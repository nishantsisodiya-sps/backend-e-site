const express = require("express");
const productController = require("../controller/productController");
const authMiddleware = require("../middleware/authMiddleware");
const verifySeller = require("../middleware/verifySeller");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const checkToken = require("../middleware/checkerMiddleware");
const router = express.Router();
const superAdminCheck = require("../middleware/superAdminCheck");

// Get all products
router.get("/", productController.getProducts);

router.get("/search", productController.searchProduct);

// Get single product by ID
router.get("/:id", productController.getSingleProduct);

// Add a new product
router.post(
  "/add",

  authMiddleware.authenticateSeller,
  verifySeller,
  uploadMiddleware.upload,
  productController.addProduct
);

// Get all products of a seller
router.get(
  "/seller/:sellerId",
  superAdminCheck.authenticateSellerOrSuperAdmin,
  productController.getSellerProducts
);

router.patch(
  "/:id",

  authMiddleware.authenticateSeller,
  uploadMiddleware.upload,
  productController.updateProduct
);

router.delete(
  "/:id",

  authMiddleware.authenticateSeller,
  productController.deleteProduct
);

module.exports = router;
