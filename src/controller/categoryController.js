const ProductCategory = require("../models/categories");
const Product = require("../models/products");

//<<<<<<<======================  CREATE AND SAVE A NEW PRODUCT CATEGORY ================>>>>>>>>

exports.create = async (req, res) => {
  try {
    console.log("Creating a new product category...");

    // Validate request
    if (!req.body.name) {
      return res.status(400).send({
        message: "Product Category name can not be empty.",
      });
    }

    // Create a Product Category
    const productCategory = new ProductCategory({
      name: req.body.name,
      status: req.body.status || "active",
    });

    // Save Product Category in the database
    const savedProductCategory = await productCategory.save();

    console.log("Product category created successfully.");
    res.send(savedProductCategory);
  } catch (err) {
    console.log("Error creating product category:", err);
    res.status(500).send({
      message:
        err.message ||
        "Some error occurred while creating the Product Category.",
    });
  }
};

//<<<<<<<====================== RETURN ALL PRODUCTS CATEGORIES FROM THE DATABASE ================>>>>>>>>


exports.findAll = async (req, res) => {
  try {
    const productCategories = await ProductCategory.find();
    res.send(productCategories);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Some error occurred while retrieving Product Categories.",
    });
  }
};


//<<<<<<<====================== FIND A SINGLE PRODUCT CATEGORY WITH A PRODUCT CATEGORY ID ================>>>>>>>>


exports.findOne = (req, res) => {
  ProductCategory.findById(req.params.productCategoryId)
    .then((productCategory) => {
      if (!productCategory) {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      res.send(productCategory);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      return res.status(500).send({
        message:
          "Error retrieving Product Category with id " +
          req.params.productCategoryId,
      });
    });
};



// Update a Product Category identified by the productCategoryId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body.name) {
    return res.status(400).send({
      message: "Product Category name can not be empty.",
    });
  }

  // Find Product Category and update it with the request body
  ProductCategory.findByIdAndUpdate(
    req.params.productCategoryId,
    {
      name: req.body.name,
      status: req.body.status || "active",
    },
    { new: true }
  )
    .then((productCategory) => {
      if (!productCategory) {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      res.send(productCategory);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      return res.status(500).send({
        message:
          "Error updating Product Category with id " +
          req.params.productCategoryId,
      });
    });
};



// Delete a Product Category with the specified productCategoryId in the request
exports.delete = (req, res) => {
  ProductCategory.findByIdAndRemove(req.params.productCategoryId)
    .then((productCategory) => {
      if (!productCategory) {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      res.send({ message: "Product Category deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      return res.status(500).send({
        message:
          "Could not delete Product Category with id " +
          req.params.productCategoryId,
      });
    });
};



// Update a Product Category identified by the productCategoryId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body.name) {
    return res.status(400).send({
      message: "Product Category name can not be empty",
    });
  }

  // Find product category and update it with the request body
  ProductCategory.findByIdAndUpdate(
    req.params.productCategoryId,
    {
      name: req.body.name,
      description: req.body.description || "",
      image: req.body.image || "",
      status: req.body.status || "active",
    },
    { new: true }
  )
    .then((productCategory) => {
      if (!productCategory) {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      res.send(productCategory);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message:
            "Product Category not found with id " +
            req.params.productCategoryId,
        });
      }
      return res.status(500).send({
        message:
          "Error updating Product Category with id " +
          req.params.productCategoryId,
      });
    });
};

//<<<<<<<====================== GET PRODUCTS BY CATEGORY CATEGORY ================>>>>>>>>


exports.getProductsByCategory = (req, res) => {
  const categoryId = req.params.productCategoryId;

  // Find all products with the specified category ID
  Product.find({ category: categoryId })
    .populate("category", "name") // Optional: Populate the category field with its name
    .then((products) => {
      res.send(products);
    })
    .catch((err) => {
      console.error("Error retrieving products by category:", err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving products by category.",
      });
    });
};
