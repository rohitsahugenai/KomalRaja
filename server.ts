import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type {
  User,
  Category,
  Product,
  CustomerProduct,
  Order,
  CustomerOrder,
  OrderStatus,
  Invoice,
  AppNotification,
  AuditLog,
  SystemSettings,
  ManagerPermissions,
} from './src/types.ts';

// -------------------------------------------------------------
// IN-MEMORY DATABASE WITH ROBUST B2B SNACK DEALER SEED DATA
// -------------------------------------------------------------

const users: User[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    email: 'admin@example.com',
    phone: '9820011223',
    role: 'SUPER_ADMIN',
    shop_name: 'Shree Ganesh Snack Distributors (HQ)',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'usr-mgr-1',
    username: 'manager',
    email: 'manager@example.com',
    phone: '9820044556',
    role: 'MANAGER',
    shop_name: 'Shree Ganesh Snack Distributors (Depot 1)',
    permissions: {
      view_orders: true,
      manage_orders: true,
      view_customers: true,
      manage_customers: true,
      view_products: true,
      delete_products: false,
      manage_admins: false,
      system_settings: false,
    },
    is_active: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'usr-cust-1',
    username: 'rajesh',
    email: 'customer@example.com',
    phone: '9876543210',
    role: 'CUSTOMER',
    shop_name: 'Sharma Kirana & General Store',
    business_type: 'Retail Kirana Store',
    address: 'Shop 14, Main Market, Station Road',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395003',
    gstin: '24AAECS1234F1ZG',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'usr-cust-2',
    username: 'vikram',
    email: 'vikram@abcstore.com',
    phone: '9876543211',
    role: 'CUSTOMER',
    shop_name: 'ABC Super Daily Needs',
    business_type: 'Departmental Mart',
    address: 'Plot 45, Ring Road Complex',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    gstin: '24BBCDE5678G2ZH',
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'usr-cust-3',
    username: 'gupta',
    email: 'gupta@mart.com',
    phone: '9876543212',
    role: 'CUSTOMER',
    shop_name: 'Gupta Sweets & Farsan Mart',
    business_type: 'Sweet & Snack Retailer',
    address: '88 Gandhi Chowk, Near Clock Tower',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: '390001',
    is_active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// In a production app, use bcrypt. For this environment we verify against our standard demo credentials.
const userCredentials: Record<string, string> = {
  'admin@example.com': 'Admin@123',
  'admin': 'Admin@123',
  '9820011223': 'Admin@123',
  'manager@example.com': 'Manager@123',
  'manager': 'Manager@123',
  '9820044556': 'Manager@123',
  'customer@example.com': 'Customer@123',
  'rajesh': 'Customer@123',
  '9876543210': 'Customer@123',
  'vikram@abcstore.com': 'Customer@123',
  'vikram': 'Customer@123',
  'gupta@mart.com': 'Customer@123',
  'gupta': 'Customer@123',
};

const categories: Category[] = [
  { id: 'cat-chips', name: 'Potato & Banana Chips', slug: 'chips', icon: 'Cookie', sort_order: 1, is_active: true, description: 'Crispy wafer sliced chips in classic and spiced variants' },
  { id: 'cat-bhujia', name: 'Bhujia & Bikaneri', slug: 'bhujia', icon: 'Flame', sort_order: 2, is_active: true, description: 'Traditional moth flour and spiced aloo bhujia' },
  { id: 'cat-namkeen', name: 'Namkeen & Mixtures', slug: 'namkeen', icon: 'Sparkles', sort_order: 3, is_active: true, description: 'Savory namkeen blends, navratan and khatta meetha' },
  { id: 'cat-sev', name: 'Sev & Gathiya', slug: 'sev', icon: 'Zap', sort_order: 4, is_active: true, description: 'Ratlami sev, nylon sev and spiced Bhavnagari gathiya' },
  { id: 'cat-peanuts', name: 'Peanuts & Chana', slug: 'peanuts', icon: 'Nut', sort_order: 5, is_active: true, description: 'Roasted hing-jeera peanuts, salted and masala nuts' },
  { id: 'cat-corn', name: 'Corn Snacks & Fryums', slug: 'corn-fryums', icon: 'Shapes', sort_order: 6, is_active: true, description: 'Puffed corn rings, pasta fryums, wheels and tubes' },
  { id: 'cat-special', name: 'Festive & Premium Farsan', slug: 'festive-special', icon: 'Award', sort_order: 7, is_active: true, description: 'Cashew mixture, dry fruit chivda and special farsan' },
];

const products: Product[] = [
  {
    id: 'prod-1',
    code: 'DSK-AB-200',
    name: 'Royal Aloo Bhujia',
    brand: 'DealerSnack Master',
    category_id: 'cat-bhujia',
    description: 'Crisp potato and gram-flour sev seasoned with cooling mint and rich Indian spices. High retail repeat rate.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 1200,
    min_stock: 150,
    image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    purchase_price: 36.0,
    selling_price: 48.0,
    gst_rate: 12,
  },
  {
    id: 'prod-2',
    code: 'DSK-AB-500',
    name: 'Royal Aloo Bhujia (Family Pack)',
    brand: 'DealerSnack Master',
    category_id: 'cat-bhujia',
    description: 'Economy 500g zipper pouch of our bestselling fresh mint aloo bhujia for family buyers.',
    pack_size: '500g Pouch',
    unit: 'Pouch',
    stock_qty: 650,
    min_stock: 80,
    image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    purchase_price: 84.0,
    selling_price: 110.0,
    gst_rate: 12,
  },
  {
    id: 'prod-3',
    code: 'DSK-BB-200',
    name: 'Bikaneri Authentic Bhujia',
    brand: 'Desi Royal',
    category_id: 'cat-bhujia',
    description: 'Made from pure moth dal flour and pungent peppercorn. True Rajasthan flavor profile.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 880,
    min_stock: 100,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    purchase_price: 38.0,
    selling_price: 50.0,
    gst_rate: 12,
  },
  {
    id: 'prod-4',
    code: 'DSK-PC-SALT-100',
    name: 'Crispy Potato Chips (Classic Salted)',
    brand: 'CrunchBite',
    category_id: 'cat-chips',
    description: 'Thin cut, farm-fresh Himalayan rock-salt golden potato chips with ultra crunch.',
    pack_size: '100g Packet',
    unit: 'Packet',
    stock_qty: 1500,
    min_stock: 200,
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    purchase_price: 18.0,
    selling_price: 25.0,
    gst_rate: 12,
  },
  {
    id: 'prod-5',
    code: 'DSK-PC-MAS-100',
    name: 'Crispy Potato Chips (Tangy Chatpata Masala)',
    brand: 'CrunchBite',
    category_id: 'cat-chips',
    description: 'Spiced with dry mango, cumin, chili, and chaat masala. One of the highest volume sellers in kiranas.',
    pack_size: '100g Packet',
    unit: 'Packet',
    stock_qty: 1800,
    min_stock: 250,
    image_url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    purchase_price: 18.0,
    selling_price: 25.0,
    gst_rate: 12,
  },
  {
    id: 'prod-6',
    code: 'DSK-BC-100',
    name: 'Kerala Yellow Banana Chips (Coconut Oil Fried)',
    brand: 'SouthCoast Gold',
    category_id: 'cat-chips',
    description: 'Thin wafer slices of raw Nendran banana flash fried in pure coconut oil and sea salt.',
    pack_size: '100g Packet',
    unit: 'Packet',
    stock_qty: 740,
    min_stock: 90,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    purchase_price: 28.0,
    selling_price: 40.0,
    gst_rate: 5,
  },
  {
    id: 'prod-7',
    code: 'DSK-SEV-RAT-200',
    name: 'Spicy Ratlami Sev (Laung & Clove Flavored)',
    brand: 'Malwa Express',
    category_id: 'cat-sev',
    description: 'Legendary pungent Ratlam recipe with roasted cloves, carom seeds and fiery black pepper.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 920,
    min_stock: 120,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    purchase_price: 34.0,
    selling_price: 46.0,
    gst_rate: 12,
  },
  {
    id: 'prod-8',
    code: 'DSK-SEV-NYL-200',
    name: 'Zero-Size Nylon Sev (Chaat Special)',
    brand: 'ChaatMaster',
    category_id: 'cat-sev',
    description: 'Ultra-thin, melt-in-mouth yellow sev ideal for bhelpuri, sev puri, and daily snack garnishing.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 1100,
    min_stock: 140,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    purchase_price: 30.0,
    selling_price: 42.0,
    gst_rate: 12,
  },
  {
    id: 'prod-9',
    code: 'DSK-MIX-NAV-200',
    name: 'Royal Navratan Mixture',
    brand: 'DealerSnack Master',
    category_id: 'cat-namkeen',
    description: '9 jewel ingredients: cashews, peanuts, raisins, puffed rice, green peas, lentils, and crispy sev.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 850,
    min_stock: 100,
    image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    purchase_price: 42.0,
    selling_price: 58.0,
    gst_rate: 12,
  },
  {
    id: 'prod-10',
    code: 'DSK-MIX-KM-200',
    name: 'Khatta Meetha Sweet & Sour Mixture',
    brand: 'DealerSnack Master',
    category_id: 'cat-namkeen',
    description: 'Sweet and tangy golden mixture with golden sago, puffed rice, sev, and raisins.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 990,
    min_stock: 110,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    purchase_price: 32.0,
    selling_price: 45.0,
    gst_rate: 12,
  },
  {
    id: 'prod-11',
    code: 'DSK-NUT-MAS-200',
    name: 'Spiced Hing-Jeera Masala Peanuts',
    brand: 'NutriCrunch',
    category_id: 'cat-peanuts',
    description: 'Double roasted jumbo Saurashtra peanuts coated with spicy besan crust and hing aroma.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 620,
    min_stock: 90,
    image_url: 'https://images.unsplash.com/photo-1569460275715-7034b172a392?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    purchase_price: 38.0,
    selling_price: 52.0,
    gst_rate: 5,
  },
  {
    id: 'prod-12',
    code: 'DSK-CORN-RNG-100',
    name: 'Tomato Tangy Corn Puff Rings',
    brand: 'FunBites',
    category_id: 'cat-corn',
    description: 'Air-baked crunchy corn rings drenched in sweet and spicy tomato dust. Kid-favorite snacking choice.',
    pack_size: '100g Packet',
    unit: 'Packet',
    stock_qty: 1300,
    min_stock: 180,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    purchase_price: 15.0,
    selling_price: 22.0,
    gst_rate: 12,
  },
  {
    id: 'prod-13',
    code: 'DSK-FRY-WHL-200',
    name: 'Masala Fryums Wheels',
    brand: 'FunBites',
    category_id: 'cat-corn',
    description: 'Crunchy potato-flour wheel fryums seasoned with chaat seasonings and toasted cumin.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 820,
    min_stock: 120,
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    purchase_price: 24.0,
    selling_price: 35.0,
    gst_rate: 12,
  },
  {
    id: 'prod-14',
    code: 'DSK-DAL-MNG-200',
    name: 'Salted Crisp Moong Dal',
    brand: 'Desi Royal',
    category_id: 'cat-special',
    description: 'Golden fried dehusked moong lentils seasoned with pure rock salt. Light and crunchy.',
    pack_size: '200g Packet',
    unit: 'Packet',
    stock_qty: 700,
    min_stock: 100,
    image_url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    is_available: true,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    purchase_price: 36.0,
    selling_price: 48.0,
    gst_rate: 5,
  },
];

const orders: Order[] = [
  {
    id: 'ord-101',
    order_number: 'ORD-20260918-000101',
    customer_id: 'usr-cust-1',
    customer_name: 'Rajesh Kumar (Sharma Kirana)',
    shop_name: 'Sharma Kirana & General Store',
    customer_phone: '9876543210',
    delivery_address: 'Shop 14, Main Market, Station Road, Surat, Gujarat - 395003',
    delivery_date: '2026-09-19',
    notes: 'Please pack in heavy cardboard corrugated cartons. Morning delivery before 11 AM preferred.',
    status: 'PROCESSING',
    total_products_count: 4,
    total_units: 80,
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), note: 'Order submitted by customer' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), note: 'Confirmed by Admin, stock reserved', updated_by: 'Admin' },
      { status: 'PROCESSING', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'Items gathered in packing bay', updated_by: 'Warehouse' },
    ],
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    subtotal: 3120,
    tax_amount: 374.4,
    discount: 50,
    grand_total: 3444.4,
    dealer_margin: 780,
    invoice_id: 'inv-101',
    items: [
      {
        id: 'item-1',
        order_id: 'ord-101',
        product_id: 'prod-1',
        product_name: 'Royal Aloo Bhujia',
        sku: 'DSK-AB-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
        unit_price: 48,
        gst_rate: 12,
        gst_amount: 172.8,
        total_price: 1612.8,
      },
      {
        id: 'item-2',
        order_id: 'ord-101',
        product_id: 'prod-4',
        product_name: 'Crispy Potato Chips (Classic Salted)',
        sku: 'DSK-PC-SALT-100',
        pack_size: '100g Packet',
        unit: 'Packet',
        quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
        unit_price: 25,
        gst_rate: 12,
        gst_amount: 75,
        total_price: 700,
      },
      {
        id: 'item-3',
        order_id: 'ord-101',
        product_id: 'prod-7',
        product_name: 'Spicy Ratlami Sev (Laung & Clove Flavored)',
        sku: 'DSK-SEV-RAT-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        unit_price: 46,
        gst_rate: 12,
        gst_amount: 82.8,
        total_price: 772.8,
      },
      {
        id: 'item-4',
        order_id: 'ord-101',
        product_id: 'prod-11',
        product_name: 'Spiced Hing-Jeera Masala Peanuts',
        sku: 'DSK-NUT-MAS-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 10,
        image_url: 'https://images.unsplash.com/photo-1569460275715-7034b172a392?w=600&auto=format&fit=crop&q=80',
        unit_price: 52,
        gst_rate: 5,
        gst_amount: 26,
        total_price: 546,
      },
    ],
  },
  {
    id: 'ord-100',
    order_number: 'ORD-20260917-000099',
    customer_id: 'usr-cust-1',
    customer_name: 'Rajesh Kumar (Sharma Kirana)',
    shop_name: 'Sharma Kirana & General Store',
    customer_phone: '9876543210',
    delivery_address: 'Shop 14, Main Market, Station Road, Surat, Gujarat - 395003',
    delivery_date: '2026-09-18',
    notes: 'Urgent festival stock for upcoming weekend.',
    status: 'DELIVERED',
    total_products_count: 3,
    total_units: 60,
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 36 * 3600000).toISOString(), note: 'Order placed by customer' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 34 * 3600000).toISOString(), note: 'Order accepted' },
      { status: 'PROCESSING', timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), note: 'Bags sealed and packed' },
      { status: 'READY_FOR_DISPATCH', timestamp: new Date(Date.now() - 25 * 3600000).toISOString(), note: 'Ready at dispatch dock' },
      { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 20 * 3600000).toISOString(), note: 'Loaded in delivery van #GJ05-BX-4421' },
      { status: 'DELIVERED', timestamp: new Date(Date.now() - 16 * 3600000).toISOString(), note: 'Delivered and acknowledged by shop owner' },
    ],
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 3600000).toISOString(),
    subtotal: 2800,
    tax_amount: 336,
    discount: 0,
    grand_total: 3136,
    dealer_margin: 710,
    invoice_id: 'inv-100',
    items: [
      {
        id: 'item-10',
        order_id: 'ord-100',
        product_id: 'prod-1',
        product_name: 'Royal Aloo Bhujia',
        sku: 'DSK-AB-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
        unit_price: 48,
        gst_rate: 12,
        gst_amount: 115.2,
        total_price: 1075.2,
      },
      {
        id: 'item-11',
        order_id: 'ord-100',
        product_id: 'prod-5',
        product_name: 'Crispy Potato Chips (Tangy Chatpata Masala)',
        sku: 'DSK-PC-MAS-100',
        pack_size: '100g Packet',
        unit: 'Packet',
        quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80',
        unit_price: 25,
        gst_rate: 12,
        gst_amount: 75,
        total_price: 700,
      },
      {
        id: 'item-12',
        order_id: 'ord-100',
        product_id: 'prod-9',
        product_name: 'Royal Navratan Mixture',
        sku: 'DSK-MIX-NAV-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80',
        unit_price: 58,
        gst_rate: 12,
        gst_amount: 104.4,
        total_price: 974.4,
      },
    ],
  },
  {
    id: 'ord-102',
    order_number: 'ORD-20260918-000102',
    customer_id: 'usr-cust-2',
    customer_name: 'Vikram Patel (ABC Super Daily)',
    shop_name: 'ABC Super Daily Needs',
    customer_phone: '9876543211',
    delivery_address: 'Plot 45, Ring Road Complex, Ahmedabad, Gujarat - 380015',
    notes: 'Please attach printout of invoice on top of outer carton.',
    status: 'PENDING',
    total_products_count: 3,
    total_units: 45,
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), note: 'Order placed by customer' },
    ],
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    subtotal: 1950,
    tax_amount: 220,
    grand_total: 2170,
    dealer_margin: 490,
    items: [
      {
        id: 'item-20',
        order_id: 'ord-102',
        product_id: 'prod-6',
        product_name: 'Kerala Yellow Banana Chips (Coconut Oil Fried)',
        sku: 'DSK-BC-100',
        pack_size: '100g Packet',
        unit: 'Packet',
        quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop&q=80',
        unit_price: 40,
        gst_rate: 5,
        gst_amount: 30,
        total_price: 630,
      },
      {
        id: 'item-21',
        order_id: 'ord-102',
        product_id: 'prod-8',
        product_name: 'Zero-Size Nylon Sev (Chaat Special)',
        sku: 'DSK-SEV-NYL-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        unit_price: 42,
        gst_rate: 12,
        gst_amount: 100.8,
        total_price: 940.8,
      },
      {
        id: 'item-22',
        order_id: 'ord-102',
        product_id: 'prod-12',
        product_name: 'Tomato Tangy Corn Puff Rings',
        sku: 'DSK-CORN-RNG-100',
        pack_size: '100g Packet',
        unit: 'Packet',
        quantity: 10,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
        unit_price: 22,
        gst_rate: 12,
        gst_amount: 26.4,
        total_price: 246.4,
      },
    ],
  },
];

const invoices: Invoice[] = [
  {
    id: 'inv-101',
    invoice_number: 'INV-20260918-000101',
    order_id: 'ord-101',
    order_number: 'ORD-20260918-000101',
    invoice_date: '2026-09-18',
    due_date: '2026-09-25',
    customer_id: 'usr-cust-1',
    customer_name: 'Rajesh Kumar',
    shop_name: 'Sharma Kirana & General Store',
    customer_phone: '9876543210',
    customer_address: 'Shop 14, Main Market, Station Road, Surat, Gujarat - 395003',
    customer_gstin: '24AAECS1234F1ZG',
    dealer_name: 'Shree Ganesh Snack Distributors',
    dealer_address: 'Godown 102, GIDC Industrial Estate, Surat, Gujarat - 395010',
    dealer_phone: '+91 98200 11223',
    dealer_email: 'billing@dealersnack.com',
    dealer_gstin: '24AABCS1429B1Z8',
    items: [
      {
        product_id: 'prod-1',
        product_name: 'Royal Aloo Bhujia',
        sku: 'DSK-AB-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 30,
        rate: 48,
        amount: 1440,
        gst_rate: 12,
        gst_amount: 172.8,
        total: 1612.8,
      },
      {
        product_id: 'prod-4',
        product_name: 'Crispy Potato Chips (Classic Salted)',
        sku: 'DSK-PC-SALT-100',
        pack_size: '100g Packet',
        unit: 'Packet',
        quantity: 25,
        rate: 25,
        amount: 625,
        gst_rate: 12,
        gst_amount: 75,
        total: 700,
      },
      {
        product_id: 'prod-7',
        product_name: 'Spicy Ratlami Sev (Laung & Clove Flavored)',
        sku: 'DSK-SEV-RAT-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 15,
        rate: 46,
        amount: 690,
        gst_rate: 12,
        gst_amount: 82.8,
        total: 772.8,
      },
      {
        product_id: 'prod-11',
        product_name: 'Spiced Hing-Jeera Masala Peanuts',
        sku: 'DSK-NUT-MAS-200',
        pack_size: '200g Packet',
        unit: 'Packet',
        quantity: 10,
        rate: 52,
        amount: 520,
        gst_rate: 5,
        gst_amount: 26,
        total: 546,
      },
    ],
    subtotal: 3275,
    discount: 50,
    taxable_amount: 3225,
    cgst: 178.3,
    sgst: 178.3,
    igst: 0,
    total_gst: 356.6,
    grand_total: 3581.6,
    payment_terms: 'Payment due within 7 days from dispatch date via NEFT/UPI/Cheque.',
    whatsapp_sent: true,
    whatsapp_sent_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

const notifications: AppNotification[] = [
  {
    id: 'notif-1',
    target_role: 'ADMIN',
    title: 'New Order Received',
    message: 'Order ORD-20260918-000102 received from ABC Super Daily Needs (45 Units)',
    type: 'order_received',
    order_id: 'ord-102',
    order_number: 'ORD-20260918-000102',
    read: false,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    target_user_id: 'usr-cust-1',
    title: 'Order Processing',
    message: 'Your order ORD-20260918-000101 is now being prepared for dispatch.',
    type: 'status_update',
    order_id: 'ord-101',
    order_number: 'ORD-20260918-000101',
    read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const auditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    user_id: 'usr-admin-1',
    user_name: 'admin',
    role: 'SUPER_ADMIN',
    action: 'ORDER_STATUS_CHANGED',
    entity: 'Order',
    entity_id: 'ord-101',
    ip: '127.0.0.1',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    details: 'Status updated from CONFIRMED to PROCESSING',
  },
  {
    id: 'aud-2',
    user_id: 'usr-admin-1',
    user_name: 'admin',
    role: 'SUPER_ADMIN',
    action: 'INVOICE_GENERATED',
    entity: 'Invoice',
    entity_id: 'inv-101',
    ip: '127.0.0.1',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    details: 'Generated invoice INV-20260918-000101 for ₹3,581.60',
  },
];

const systemSettings: SystemSettings = {
  company_name: 'Shree Ganesh Snacks & Namkeen Distributors',
  dealer_phone: '+91 98200 11223',
  dealer_email: 'orders@dealersnack.com',
  gstin: '24AABCS1429B1Z8',
  address: 'Godown 102, GIDC Industrial Estate, Pandesara',
  city: 'Surat',
  state: 'Gujarat',
  pincode: '395010',
  whatsapp_number: '919820011223',
  whatsapp_provider: 'Cloud API Direct',
  default_gst_rate: 12,
  currency_symbol: '₹',
  order_prefix: 'ORD-',
  invoice_prefix: 'INV-',
  min_order_units: 10,
  notification_enabled: true,
};

// -------------------------------------------------------------
// DTO UTILITY: ZERO LEAKAGE OF PRICING TO CUSTOMERS
// -------------------------------------------------------------

function toCustomerProduct(p: Product): CustomerProduct {
  let stock_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
  if (p.stock_qty <= 0 || !p.is_available) {
    stock_status = 'OUT_OF_STOCK';
  } else if (p.stock_qty <= p.min_stock) {
    stock_status = 'LOW_STOCK';
  }

  return {
    id: p.id,
    code: p.code,
    name: p.name,
    brand: p.brand,
    category_id: p.category_id,
    description: p.description,
    pack_size: p.pack_size,
    unit: p.unit,
    image_url: p.image_url,
    is_available: p.is_available && p.stock_qty > 0,
    stock_status,
  };
}

function toCustomerOrder(o: Order): CustomerOrder {
  return {
    id: o.id,
    order_number: o.order_number,
    customer_id: o.customer_id,
    customer_name: o.customer_name,
    shop_name: o.shop_name,
    customer_phone: o.customer_phone,
    delivery_address: o.delivery_address,
    delivery_date: o.delivery_date,
    notes: o.notes,
    status: o.status,
    total_products_count: o.total_products_count,
    total_units: o.total_units,
    timeline: o.timeline,
    created_at: o.created_at,
    updated_at: o.updated_at,
    items: o.items.map((item) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      pack_size: item.pack_size,
      unit: item.unit,
      quantity: item.quantity,
      image_url: item.image_url,
    })),
  };
}

// -------------------------------------------------------------
// AUTH HELPER (Simple session token / Bearer token simulation)
// -------------------------------------------------------------

interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '').trim();
  // We encode user id directly into mock token "dsk_token_<userId>"
  if (token.startsWith('dsk_token_')) {
    const userId = token.replace('dsk_token_', '');
    const user = users.find((u) => u.id === userId && u.is_active);
    if (user) {
      req.user = user;
    }
  }
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions for this resource.' });
    }
    next();
  };
}

// -------------------------------------------------------------
// MAIN SERVER INITIALIZATION
// -------------------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'DealerSnack B2B API', time: new Date().toISOString() });
  });

  // -----------------------------------------------------------
  // AUTHENTICATION ROUTES
  // -----------------------------------------------------------

  // Login: Support username, email, or phone number
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password, roleHint } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email/Phone and Password are required.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '')
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found with these credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account is deactivated. Please contact dealer management.' });
    }

    // Role check if roleHint specified (e.g. logging into Admin portal with customer credentials)
    if (roleHint === 'ADMIN' && user.role === 'CUSTOMER') {
      return res.status(403).json({ error: 'Customer credentials cannot be used to access the Admin Portal.' });
    }
    if (roleHint === 'CUSTOMER' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MANAGER')) {
      // Admins are allowed to test/view customer ordering or switch roles
    }

    const storedPass =
      userCredentials[user.email] ||
      userCredentials[user.username] ||
      userCredentials[user.phone] ||
      'Customer@123';

    if (password !== storedPass && password !== 'Admin@123' && password !== 'Manager@123' && password !== 'Customer@123') {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    const token = `dsk_token_${user.id}`;

    // Audit log
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: user.id,
      user_name: user.username,
      role: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entity_id: user.id,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Logged in via ${user.role} portal`,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        shop_name: user.shop_name,
        business_type: user.business_type,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        gstin: user.gstin,
        permissions: user.permissions,
      },
    });
  });

  // Current session
  app.get('/api/auth/me', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.user });
  });

  // Logout
  app.post('/api/auth/logout', (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Demo user quick-switch endpoint
  app.post('/api/auth/demo-login', (req, res) => {
    const { targetRole } = req.body;
    let targetUser: User | undefined;

    if (targetRole === 'SUPER_ADMIN') {
      targetUser = users.find((u) => u.role === 'SUPER_ADMIN');
    } else if (targetRole === 'MANAGER') {
      targetUser = users.find((u) => u.role === 'MANAGER');
    } else {
      targetUser = users.find((u) => u.role === 'CUSTOMER');
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const token = `dsk_token_${targetUser.id}`;
    res.json({ token, user: targetUser });
  });

  // -----------------------------------------------------------
  // CUSTOMER APPLICATION APIS (CRITICAL: ZERO PRICING EXPOSED)
  // -----------------------------------------------------------

  // Get products catalog (NO PRICES)
  app.get('/api/customer/products', (_req, res) => {
    const customerProducts = products
      .filter((p) => p.is_available)
      .map(toCustomerProduct);
    res.json(customerProducts);
  });

  // Get categories
  app.get('/api/customer/categories', (_req, res) => {
    const activeCats = categories.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order);
    res.json(activeCats);
  });

  // Get customer's own orders (NO FINANCIAL TOTALS)
  app.get('/api/customer/orders', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.json([]);
    }

    const myOrders = orders
      .filter((o) => o.customer_id === req.user!.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(toCustomerOrder);

    res.json(myOrders);
  });

  // Get single order detail for customer (NO PRICES)
  app.get('/api/customer/orders/:id', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const order = orders.find((o) => o.id === req.params.id && o.customer_id === req.user!.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(toCustomerOrder(order));
  });

  // Customer places order
  app.post('/api/customer/orders', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to place order' });
    }

    const { items: cartItems, notes, preferred_date, delivery_address } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Your order cart cannot be empty.' });
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(orders.length + 1).padStart(6, '0');
    const orderNumber = `ORD-${dateStr}-${seq}`;
    const orderId = `ord-${Date.now()}`;

    let totalUnits = 0;
    let subtotalCalc = 0;
    let totalTaxCalc = 0;
    let totalCostCalc = 0;

    const orderItems: Order['items'] = [];

    for (const ci of cartItems) {
      const prod = products.find((p) => p.id === ci.productId);
      if (!prod) continue;
      const qty = Math.max(1, parseInt(ci.quantity, 10) || 1);
      totalUnits += qty;

      const itemSubtotal = prod.selling_price * qty;
      const itemTax = (itemSubtotal * prod.gst_rate) / 100;
      const itemCost = prod.purchase_price * qty;

      subtotalCalc += itemSubtotal;
      totalTaxCalc += itemTax;
      totalCostCalc += itemCost;

      orderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        order_id: orderId,
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.code,
        pack_size: prod.pack_size,
        unit: prod.unit,
        quantity: qty,
        image_url: prod.image_url,
        // Dealer internal financial records
        unit_price: prod.selling_price,
        gst_rate: prod.gst_rate,
        gst_amount: itemTax,
        total_price: itemSubtotal + itemTax,
      });
    }

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: req.user.id,
      customer_name: req.user.username + (req.user.shop_name ? ` (${req.user.shop_name})` : ''),
      shop_name: req.user.shop_name || 'Retail Customer Store',
      customer_phone: req.user.phone,
      delivery_address: delivery_address || req.user.address || 'Address pending verification',
      delivery_date: preferred_date || undefined,
      notes: notes || '',
      status: 'PENDING',
      total_products_count: orderItems.length,
      total_units: totalUnits,
      timeline: [
        {
          status: 'PENDING',
          timestamp: now.toISOString(),
          note: 'Order submitted by customer via DealerSnack B2B App',
        },
      ],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      // Internal dealer finances
      subtotal: Math.round(subtotalCalc * 100) / 100,
      tax_amount: Math.round(totalTaxCalc * 100) / 100,
      discount: 0,
      grand_total: Math.round((subtotalCalc + totalTaxCalc) * 100) / 100,
      dealer_margin: Math.round((subtotalCalc - totalCostCalc) * 100) / 100,
      items: orderItems,
    };

    orders.unshift(newOrder);

    // Push notification to Admin
    notifications.unshift({
      id: `notif-${Date.now()}`,
      target_role: 'ADMIN',
      title: 'New Order Received',
      message: `Order ${newOrder.order_number} placed by ${newOrder.shop_name} (${newOrder.total_units} Units)`,
      type: 'order_received',
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      read: false,
      created_at: now.toISOString(),
    });

    // Audit log
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: req.user.id,
      user_name: req.user.username,
      role: req.user.role,
      action: 'ORDER_PLACED',
      entity: 'Order',
      entity_id: newOrder.id,
      ip: req.ip || '127.0.0.1',
      timestamp: now.toISOString(),
      details: `Created order ${newOrder.order_number} with ${totalUnits} units`,
    });

    // Return sanitized CustomerOrder (NO PRICES)
    res.status(201).json(toCustomerOrder(newOrder));
  });

  // Customer Profile
  app.get('/api/customer/profile', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.json(req.user);
  });

  app.put('/api/customer/profile', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const idx = users.findIndex((u) => u.id === req.user!.id);
    if (idx !== -1) {
      const { shop_name, phone, address, city, state, pincode, gstin } = req.body;
      users[idx] = {
        ...users[idx],
        shop_name: shop_name ?? users[idx].shop_name,
        phone: phone ?? users[idx].phone,
        address: address ?? users[idx].address,
        city: city ?? users[idx].city,
        state: state ?? users[idx].state,
        pincode: pincode ?? users[idx].pincode,
        gstin: gstin ?? users[idx].gstin,
      };
      req.user = users[idx];
      return res.json(users[idx]);
    }
    res.status(404).json({ error: 'User not found' });
  });

  // Customer notifications
  app.get('/api/customer/notifications', (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.json([]);
    }
    const list = notifications.filter(
      (n) => n.target_user_id === req.user!.id || (!n.target_user_id && n.target_role === 'CUSTOMER')
    );
    res.json(list);
  });

  // -----------------------------------------------------------
  // ADMIN & MANAGER DASHBOARD APIS (FULL ACCESS & PRICING)
  // -----------------------------------------------------------

  const adminRoleCheck = requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);

  // Dashboard Stats & Analytics
  app.get('/api/admin/dashboard-stats', adminRoleCheck, (req: AuthenticatedRequest, res) => {
    const isSuperAdminOrAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.created_at.startsWith(todayStr));
    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    const processingOrders = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED');
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
    const totalCustomers = users.filter((u) => u.role === 'CUSTOMER');
    const lowStockProducts = products.filter((p) => p.stock_qty <= p.min_stock);

    let totalRevenue = 0;
    let totalMargin = 0;
    orders.forEach((o) => {
      if (o.status !== 'CANCELLED') {
        totalRevenue += o.grand_total || 0;
        totalMargin += o.dealer_margin || 0;
      }
    });

    res.json({
      counts: {
        today_orders: todayOrders.length,
        pending_orders: pendingOrders.length,
        processing_orders: processingOrders.length,
        delivered_orders: deliveredOrders.length,
        total_orders: orders.length,
        total_customers: totalCustomers.length,
        total_products: products.length,
        low_stock_count: lowStockProducts.length,
      },
      // Financials provided to Admin / Super Admin
      financials: isSuperAdminOrAdmin
        ? {
            total_revenue: Math.round(totalRevenue * 100) / 100,
            total_margin: Math.round(totalMargin * 100) / 100,
            average_order_value: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
          }
        : null,
      recent_orders: orders.slice(0, 6),
    });
  });

  // Admin Orders list
  app.get('/api/admin/orders', adminRoleCheck, (req, res) => {
    const { status, customer_id, search } = req.query;
    let list = [...orders];

    if (status && status !== 'ALL') {
      list = list.filter((o) => o.status === status);
    }
    if (customer_id) {
      list = list.filter((o) => o.customer_id === customer_id);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.shop_name.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(list);
  });

  // Admin Order detail
  app.get('/api/admin/orders/:id', adminRoleCheck, (req, res) => {
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // Update order status
  app.put('/api/admin/orders/:id/status', adminRoleCheck, (req: AuthenticatedRequest, res) => {
    const { status, note } = req.body;
    const orderIndex = orders.findIndex((o) => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'READY_FOR_DISPATCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    const order = orders[orderIndex];
    const prevStatus = order.status;
    order.status = status;
    order.updated_at = new Date().toISOString();

    const noteText = note || `Status updated from ${prevStatus} to ${status}`;
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: noteText,
      updated_by: req.user?.username || 'Admin',
    });

    // Notify the customer
    let msg = `Your order ${order.order_number} is now ${status.replace(/_/g, ' ')}.`;
    if (status === 'CONFIRMED') {
      msg = `Your order ${order.order_number} has been confirmed by the dealer.`;
    } else if (status === 'PROCESSING') {
      msg = `Your order ${order.order_number} is now being prepared for dispatch.`;
    } else if (status === 'OUT_FOR_DELIVERY') {
      msg = `Your order ${order.order_number} is out for delivery with our vehicle.`;
    } else if (status === 'DELIVERED') {
      msg = `Your order ${order.order_number} has been successfully delivered.`;
    } else if (status === 'CANCELLED') {
      msg = `Your order ${order.order_number} has been cancelled. Contact the dealer for inquiries.`;
    }

    notifications.unshift({
      id: `notif-${Date.now()}`,
      target_user_id: order.customer_id,
      title: `Order ${status.replace(/_/g, ' ')}`,
      message: msg,
      type: 'status_update',
      order_id: order.id,
      order_number: order.order_number,
      read: false,
      created_at: new Date().toISOString(),
    });

    // Audit log
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: req.user?.id || 'admin',
      user_name: req.user?.username || 'Admin',
      role: req.user?.role || 'ADMIN',
      action: 'ORDER_STATUS_CHANGED',
      entity: 'Order',
      entity_id: order.id,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `${prevStatus} -> ${status}: ${noteText}`,
    });

    res.json(order);
  });

  // Generate / Fetch Invoice for an order
  app.post('/api/admin/orders/:id/generate-invoice', adminRoleCheck, (req, res) => {
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let existingInv = invoices.find((inv) => inv.order_id === order.id);
    if (existingInv) {
      return res.json(existingInv);
    }

    const now = new Date();
    const invDateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(invoices.length + 1).padStart(6, '0');
    const invoiceNumber = `INV-${invDateStr}-${seq}`;

    let subtotal = 0;
    let totalGst = 0;

    const invoiceItems = order.items.map((item) => {
      const rate = item.unit_price || 40;
      const amt = rate * item.quantity;
      const gstRate = item.gst_rate || 12;
      const gstAmt = (amt * gstRate) / 100;
      subtotal += amt;
      totalGst += gstAmt;

      return {
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        pack_size: item.pack_size,
        unit: item.unit,
        quantity: item.quantity,
        rate,
        amount: amt,
        gst_rate: gstRate,
        gst_amount: gstAmt,
        total: amt + gstAmt,
      };
    });

    const discount = req.body.discount ? parseFloat(req.body.discount) : 0;
    const taxable = Math.max(0, subtotal - discount);
    const halfGst = totalGst / 2;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      order_id: order.id,
      order_number: order.order_number,
      invoice_date: now.toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      shop_name: order.shop_name,
      customer_phone: order.customer_phone,
      customer_address: order.delivery_address,
      dealer_name: systemSettings.company_name,
      dealer_address: `${systemSettings.address}, ${systemSettings.city}, ${systemSettings.state} - ${systemSettings.pincode}`,
      dealer_phone: systemSettings.dealer_phone,
      dealer_email: systemSettings.dealer_email,
      dealer_gstin: systemSettings.gstin,
      items: invoiceItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      taxable_amount: Math.round(taxable * 100) / 100,
      cgst: Math.round(halfGst * 100) / 100,
      sgst: Math.round(halfGst * 100) / 100,
      igst: 0,
      total_gst: Math.round(totalGst * 100) / 100,
      grand_total: Math.round((taxable + totalGst) * 100) / 100,
      payment_terms: 'Payment due within 7 days from dispatch date. Bank transfer / UPI accepted.',
      whatsapp_sent: false,
      created_at: now.toISOString(),
    };

    invoices.unshift(newInvoice);
    order.invoice_id = newInvoice.id;

    res.json(newInvoice);
  });

  // Get invoice by ID
  app.get('/api/admin/invoices/:id', adminRoleCheck, (req, res) => {
    const inv = invoices.find((i) => i.id === req.params.id || i.order_id === req.params.id);
    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(inv);
  });

  // Send / Record WhatsApp bill sharing
  app.post('/api/admin/invoices/:id/whatsapp', adminRoleCheck, (req: AuthenticatedRequest, res) => {
    const inv = invoices.find((i) => i.id === req.params.id);
    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    inv.whatsapp_sent = true;
    inv.whatsapp_sent_at = new Date().toISOString();

    const cleanPhone = inv.customer_phone.replace(/[\s+-]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const text = encodeURIComponent(
      `Hello ${inv.customer_name},\n\n` +
      `Greetings from ${systemSettings.company_name}!\n\n` +
      `Your Bill #${inv.invoice_number} for Order #${inv.order_number} is ready.\n` +
      `Items: ${inv.items.length} Snacks items\n` +
      `Grand Total: ₹${inv.grand_total.toLocaleString('en-IN')}\n\n` +
      `Thank you for your business!`
    );

    const waLink = `https://wa.me/${phoneWithCountry}?text=${text}`;

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: req.user?.id || 'admin',
      user_name: req.user?.username || 'Admin',
      role: req.user?.role || 'ADMIN',
      action: 'WHATSAPP_BILL_SENT',
      entity: 'Invoice',
      entity_id: inv.id,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `WhatsApp bill sharing generated for ${inv.customer_name} (${inv.customer_phone})`,
    });

    res.json({
      success: true,
      whatsapp_url: waLink,
      invoice: inv,
    });
  });

  // Product Management (ADMIN)
  app.get('/api/admin/products', adminRoleCheck, (_req, res) => {
    res.json(products);
  });

  app.post('/api/admin/products', adminRoleCheck, (req: AuthenticatedRequest, res) => {
    const {
      name,
      code,
      brand,
      category_id,
      description,
      pack_size,
      unit,
      purchase_price,
      selling_price,
      gst_rate,
      stock_qty,
      min_stock,
      image_url,
      is_available,
    } = req.body;

    if (!name || !code || !category_id) {
      return res.status(400).json({ error: 'Product name, SKU code, and category are required.' });
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      code,
      brand: brand || 'DealerSnack Master',
      category_id,
      description: description || '',
      pack_size: pack_size || '200g Packet',
      unit: unit || 'Packet',
      purchase_price: parseFloat(purchase_price) || 30,
      selling_price: parseFloat(selling_price) || 45,
      gst_rate: parseInt(gst_rate, 10) || 12,
      stock_qty: parseInt(stock_qty, 10) || 100,
      min_stock: parseInt(min_stock, 10) || 20,
      image_url: image_url || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      is_available: is_available !== undefined ? Boolean(is_available) : true,
      created_at: new Date().toISOString(),
    };

    products.unshift(newProd);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: req.user?.id || 'admin',
      user_name: req.user?.username || 'Admin',
      role: req.user?.role || 'ADMIN',
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entity_id: newProd.id,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Added new snack product ${newProd.name} (${newProd.code})`,
    });

    res.status(201).json(newProd);
  });

  app.put('/api/admin/products/:id', adminRoleCheck, (req: AuthenticatedRequest, res) => {
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[idx] = {
      ...products[idx],
      ...req.body,
      purchase_price: req.body.purchase_price !== undefined ? parseFloat(req.body.purchase_price) : products[idx].purchase_price,
      selling_price: req.body.selling_price !== undefined ? parseFloat(req.body.selling_price) : products[idx].selling_price,
      stock_qty: req.body.stock_qty !== undefined ? parseInt(req.body.stock_qty, 10) : products[idx].stock_qty,
      min_stock: req.body.min_stock !== undefined ? parseInt(req.body.min_stock, 10) : products[idx].min_stock,
    };

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: req.user?.id || 'admin',
      user_name: req.user?.username || 'Admin',
      role: req.user?.role || 'ADMIN',
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entity_id: products[idx].id,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Updated product ${products[idx].name}`,
    });

    res.json(products[idx]);
  });

  app.delete('/api/admin/products/:id', adminRoleCheck, (req: AuthenticatedRequest, res) => {
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const removed = products.splice(idx, 1)[0];
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      user_id: req.user?.id || 'admin',
      user_name: req.user?.username || 'Admin',
      role: req.user?.role || 'ADMIN',
      action: 'PRODUCT_DELETED',
      entity: 'Product',
      entity_id: removed.id,
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      details: `Deleted product ${removed.name}`,
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // Category Management
  app.get('/api/admin/categories', adminRoleCheck, (_req, res) => {
    res.json(categories);
  });

  app.post('/api/admin/categories', adminRoleCheck, (req, res) => {
    const { name, icon, description, sort_order } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      icon: icon || 'Sparkles',
      description: description || '',
      sort_order: parseInt(sort_order, 10) || categories.length + 1,
      is_active: true,
    };
    categories.push(newCat);
    res.status(201).json(newCat);
  });

  app.put('/api/admin/categories/:id', adminRoleCheck, (req, res) => {
    const idx = categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories[idx] = { ...categories[idx], ...req.body };
    res.json(categories[idx]);
  });

  app.delete('/api/admin/categories/:id', adminRoleCheck, (req, res) => {
    const idx = categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories.splice(idx, 1);
    res.json({ success: true, message: 'Category deleted' });
  });

  // Customers management (ADMIN)
  app.get('/api/admin/customers', adminRoleCheck, (_req, res) => {
    const customers = users
      .filter((u) => u.role === 'CUSTOMER')
      .map((c) => {
        const custOrders = orders.filter((o) => o.customer_id === c.id);
        const lastOrder = custOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        const totalUnitsOrdered = custOrders.reduce((sum, o) => sum + o.total_units, 0);
        const totalValue = custOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0);

        return {
          ...c,
          total_orders: custOrders.length,
          total_units_ordered: totalUnitsOrdered,
          total_order_value: Math.round(totalValue * 100) / 100,
          last_order_date: lastOrder ? lastOrder.created_at : null,
          last_order_status: lastOrder ? lastOrder.status : null,
        };
      });
    res.json(customers);
  });

  // Managers management (SUPER_ADMIN ONLY)
  app.get('/api/admin/managers', adminRoleCheck, (_req, res) => {
    const managers = users.filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
    res.json(managers);
  });

  app.post('/api/admin/managers', requireRole(['SUPER_ADMIN']), (req, res) => {
    const { username, email, phone, permissions, role } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const defaultPerms: ManagerPermissions = {
      view_orders: true,
      manage_orders: true,
      view_customers: true,
      manage_customers: false,
      view_products: true,
      delete_products: false,
      manage_admins: false,
      system_settings: false,
      ...(permissions || {}),
    };

    const newMgr: User = {
      id: `usr-mgr-${Date.now()}`,
      username,
      email,
      phone: phone || '9820000000',
      role: role === 'ADMIN' ? 'ADMIN' : 'MANAGER',
      shop_name: 'Shree Ganesh Snack Distributors (Branch)',
      permissions: defaultPerms,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    users.push(newMgr);
    userCredentials[newMgr.email] = 'Manager@123';
    userCredentials[newMgr.username] = 'Manager@123';

    res.status(201).json(newMgr);
  });

  app.put('/api/admin/managers/:id', requireRole(['SUPER_ADMIN']), (req, res) => {
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    users[idx] = { ...users[idx], ...req.body };
    res.json(users[idx]);
  });

  // Reports & Analytics (ADMIN)
  app.get('/api/admin/reports', adminRoleCheck, (_req, res) => {
    // Product movement rankings
    const productQuantities: Record<string, { name: string; sku: string; units: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productQuantities[item.product_id]) {
          productQuantities[item.product_id] = {
            name: item.product_name,
            sku: item.sku,
            units: 0,
            revenue: 0,
          };
        }
        productQuantities[item.product_id].units += item.quantity;
        productQuantities[item.product_id].revenue += item.total_price || item.quantity * 40;
      });
    });

    const topProducts = Object.values(productQuantities).sort((a, b) => b.units - a.units);

    // Order status breakdown
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Customer purchase rank
    const customerRanks: Record<string, { name: string; shop: string; orders: number; units: number }> = {};
    orders.forEach((o) => {
      if (!customerRanks[o.customer_id]) {
        customerRanks[o.customer_id] = {
          name: o.customer_name,
          shop: o.shop_name,
          orders: 0,
          units: 0,
        };
      }
      customerRanks[o.customer_id].orders += 1;
      customerRanks[o.customer_id].units += o.total_units;
    });

    const topCustomers = Object.values(customerRanks).sort((a, b) => b.units - a.units);

    res.json({
      top_products: topProducts,
      status_breakdown: statusCounts,
      top_customers: topCustomers,
      low_stock: products.filter((p) => p.stock_qty <= p.min_stock),
    });
  });

  // Audit Logs
  app.get('/api/admin/audit-logs', adminRoleCheck, (_req, res) => {
    res.json(auditLogs.slice(0, 50));
  });

  // System Settings
  app.get('/api/admin/settings', adminRoleCheck, (_req, res) => {
    res.json(systemSettings);
  });

  app.put('/api/admin/settings', requireRole(['SUPER_ADMIN']), (req, res) => {
    Object.assign(systemSettings, req.body);
    res.json(systemSettings);
  });

  // Notifications (ADMIN)
  app.get('/api/admin/notifications', adminRoleCheck, (_req, res) => {
    const list = notifications.filter((n) => !n.target_role || n.target_role === 'ADMIN');
    res.json(list);
  });

  app.post('/api/admin/notifications/broadcast', adminRoleCheck, (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      target_role: 'CUSTOMER',
      title,
      message,
      type: 'broadcast',
      read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(notif);
    res.status(201).json(notif);
  });

  // -----------------------------------------------------------
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // -----------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DealerSnack B2B Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
