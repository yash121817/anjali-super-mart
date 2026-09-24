const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const OWNER_UID = "Np6DjB7R8XefA3YptOrj7FGVqVX2";
const PRODUCTS = path.join(__dirname, "products.json");
const ORDERS = path.join(__dirname, "orders.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function read(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get("/api/products", (req, res) => {
  res.json(read(PRODUCTS, []));
});

app.get("/api/orders", (req, res) => {
  res.json(read(ORDERS, []));
});

app.post("/api/orders", (req, res) => {
  const { customer, items, total } = req.body;

  if (!customer?.name || !customer?.mobile || !customer?.address) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile और address जरूरी है"
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart खाली है"
    });
  }

  const orders = read(ORDERS, []);

  const order = {
    id: "ASM" + Date.now(),
    customer,
    items,
    total: Number(total) || 0,
    status: "New",
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  write(ORDERS, orders);

  res.json({
    success: true,
    order
  });
});

app.put("/api/orders/:id", (req, res) => {
  const orders = read(ORDERS, []);
  const order = orders.find(x => x.id === req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order नहीं मिला"
    });
  }

  order.status = req.body.status || order.status;
  write(ORDERS, orders);

  res.json({
    success: true,
    order
  });
});

app.get("/owner", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "owner.html"));
});

app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log("   ANJALI SUPER MART");
  console.log("================================");
  console.log("Shop  : http://localhost:3000");
  console.log("Owner : http://localhost:3000/owner");
  console.log("================================");
});
