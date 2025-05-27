const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage })

let products = [
  {
    id: 1,
    name: 'iPhone 14',
    description: 'Apple smartphone',
    price: 999,
    stock: 5,
    category: 'Electronics',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    name: 'Samsung TV',
    description: '55 inch Smart TV',
    price: 699,
    stock: 8,
    category: 'Electronics',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    name: 'Nike Shoes',
    description: 'Running shoes',
    price: 120,
    stock: 15,
    category: 'Clothing',
    image: 'https://via.placeholder.com/150',
  },
]

app.get('/api/products', (req, res) => {
  res.json(products)
})

app.post('/api/products', upload.single('image'), (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body

    if (!name || !description || !price || !stock || !category) {
      return res
        .status(400)
        .json({ error: 'All fields except image are required.' })
    }

    const image = req.file
      ? `http://localhost:${PORT}/uploads/${req.file.filename}`
      : 'https://via.placeholder.com/150'

    const newProduct = {
      id: products.length + 1,
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      image,
    }

    products.push(newProduct)
    res.status(201).json(newProduct)
  } catch (err) {
    console.error('Error adding product:', err)
    res.status(500).json({ error: 'Server error while adding product.' })
  }
})

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { stock } = req.body
  const product = products.find((p) => p.id === id)
  if (product) {
    product.stock = stock
    res.json(product)
  } else {
    res.status(404).json({ error: 'Product not found' })
  }
})

app.get('/api/analytics/revenue', (req, res) => {
  const categoryFilter = req.query.category
  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products

  const totalOrders = filteredProducts.length
  const totalRevenue = filteredProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  )

  const addVariation = (avg, count) =>
    Array(count)
      .fill()
      .map(() => Math.floor(avg * (0.8 + Math.random() * 0.4)))

  const breakdown = {
    daily: addVariation(totalRevenue / 7, 7),
    weekly: addVariation(totalRevenue / 4, 4),
    monthly: addVariation(totalRevenue / 3, 3),
    annually: addVariation(totalRevenue / 2, 2),
  }

  res.json({ totalOrders, totalRevenue, breakdown })
})

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
