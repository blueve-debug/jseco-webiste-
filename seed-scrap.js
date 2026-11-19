const admin = require('firebase-admin');
const fs = require('fs');


const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const categories = [
  { label: 'Automotive', order: 1, active: true },
  { label: 'Industrial', order: 2, active: true },
  { label: 'Metals & Alloys', order: 3, active: true },
];

const products = [
  {
    name: 'End-of-Life Cars',
    icon: 'Car',
    desc: 'Complete cars with or without engines. Valid RC required.',
    badge: 'auto-badge',
    badgeText: 'Automotive',
    rate: '₹18,000 - ₹35,000',
    unit: 'per unit',
    hot: true,
    active: true
  },
  {
    name: 'Heavy Machinery',
    icon: 'Building',
    desc: 'Old industrial equipment, lathes, and generators.',
    badge: 'industry-badge',
    badgeText: 'Industrial',
    rate: '₹35 - ₹42',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Mixed Ferrous',
    icon: 'Wrench',
    desc: 'Iron, steel structures, pipes, and beams.',
    badge: 'metal-badge',
    badgeText: 'Metals',
    rate: '₹28 - ₹32',
    unit: 'per kg',
    hot: true,
    active: true
  },
];

async function seed() {
  console.log('Seeding data...');
  const catDocs = [];
  for (const cat of categories) {
    const ref = await db.collection('scrap_categories').add(cat);
    catDocs.push({ id: ref.id, name: cat.label });
    console.log(`Added category ${cat.label} with ID ${ref.id}`);
  }

  for (const prod of products) {
    let catId = '';
    if (prod.badgeText === 'Automotive') catId = catDocs.find(c => c.name === 'Automotive').id;
    if (prod.badgeText === 'Industrial') catId = catDocs.find(c => c.name === 'Industrial').id;
    if (prod.badgeText === 'Metals') catId = catDocs.find(c => c.name === 'Metals & Alloys').id;

    await db.collection('scrap_products').add({
      ...prod,
      categoryId: catId
    });
    console.log(`Added product ${prod.name}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
