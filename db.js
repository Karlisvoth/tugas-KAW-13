// db.js
const bcrypt = require('bcryptjs');

// 1. Mock Data Stores
const users = [];

const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Books' }
];

const products = [
    { id: 1, name: 'Gaming Laptop', categoryId: 1, price: 1200, description: 'High performance' },
    { id: 2, name: 'Clean Code', categoryId: 2, price: 45, description: 'A handbook of agile software craftsmanship' }
];

const comments = [];

// 2. Helper to Seed Users
(async () => {
    try {
        // --- 1. ADMIN USER ---
        // Reads from .env or uses fallback
        const adminPassPlain = process.env.ADMIN_PASSWORD || 'password123';
        const adminHash = await bcrypt.hash(adminPassPlain, 10);
        
        users.push({
            id: 1,
            username: 'admin',
            email: 'admin@test.com',
            password: adminHash,
            profile: 'I am the system administrator.'
        });

        // --- 2. JOHN DOE (Strong Password) ---
        // Password: BlueSky$99!
        const johnHash = await bcrypt.hash('BlueSky$99!', 10);
        users.push({
            id: 2,
            username: 'john_doe',
            email: 'john@example.com',
            password: johnHash,
            profile: 'Just a regular shopper looking for deals.'
        });

        // --- 3. ALICE WONDER (Strong Password) ---
        // Password: R@bbitH0le#1
        const aliceHash = await bcrypt.hash('R@bbitH0le#1', 10);
        users.push({
            id: 3,
            username: 'alice_wonder',
            email: 'alice@example.com',
            password: aliceHash,
            profile: 'I love reading books about programming.'
        });

        // --- 4. BOB BUILDER (Strong Password) ---
        // Password: FixIt!Fast2025
        const bobHash = await bcrypt.hash('FixIt!Fast2025', 10);
        users.push({
            id: 4,
            username: 'bob_builder',
            email: 'bob@example.com',
            password: bobHash,
            profile: 'Here to fix things and buy electronics.'
        });

        console.log("Mock Database: Users seeded with strong passwords.");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
})();

module.exports = { users, categories, products, comments };