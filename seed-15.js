const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const products = [
  {
    name: 'Scrap Car Batteries',
    icon: 'Battery',
    image: 'https://loremflickr.com/400/300/battery,car?lock=1',
    desc: 'Old or dead lead-acid car batteries for safe recycling.',
    badge: 'auto-badge',
    badgeText: 'Automotive',
    rate: '₹80 - ₹95',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Used Alloy Wheels',
    icon: 'Disc',
    image: 'https://loremflickr.com/400/300/wheel,alloy?lock=2',
    desc: 'Aluminium alloy wheels from scrapped cars or trucks.',
    badge: 'auto-badge',
    badgeText: 'Automotive',
    rate: '₹140 - ₹160',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Catalytic Converters',
    icon: 'Wind',
    image: 'https://loremflickr.com/400/300/catalytic,converter?lock=3',
    desc: 'Exhaust emission control devices containing precious metals.',
    badge: 'auto-badge',
    badgeText: 'Automotive',
    rate: '₹2000 - ₹5000',
    unit: 'per piece',
    hot: true,
    active: true
  },
  {
    name: 'Scrap Engines',
    icon: 'Cog',
    image: 'https://loremflickr.com/400/300/engine,car?lock=4',
    desc: 'Old cast iron or aluminium engines from decommissioned vehicles.',
    badge: 'auto-badge',
    badgeText: 'Automotive',
    rate: '₹45 - ₹60',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Electric Motors',
    icon: 'Zap',
    image: 'https://loremflickr.com/400/300/motor,electric?lock=5',
    desc: 'Industrial electric motors containing high-grade copper windings.',
    badge: 'industry-badge',
    badgeText: 'Industrial',
    rate: '₹60 - ₹85',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Heavy Duty Cables',
    icon: 'Activity',
    image: 'https://loremflickr.com/400/300/cable,copper?lock=6',
    desc: 'Thick industrial cables made of copper or aluminium.',
    badge: 'industry-badge',
    badgeText: 'Industrial',
    rate: '₹200 - ₹400',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Industrial Transformers',
    icon: 'Zap',
    image: 'https://loremflickr.com/400/300/transformer,industrial?lock=7',
    desc: 'Decommissioned power transformers for core and coil recovery.',
    badge: 'industry-badge',
    badgeText: 'Industrial',
    rate: '₹55 - ₹75',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Scrap Generators',
    icon: 'Factory',
    image: 'https://loremflickr.com/400/300/generator,diesel?lock=8',
    desc: 'Old diesel or petrol generators for metal recovery.',
    badge: 'industry-badge',
    badgeText: 'Industrial',
    rate: '₹40 - ₹50',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Mild Steel (MS) Scrap',
    icon: 'Building',
    image: 'https://loremflickr.com/400/300/steel,scrap?lock=9',
    desc: 'Industrial steel plates, angles, and construction leftovers.',
    badge: 'industry-badge',
    badgeText: 'Industrial',
    rate: '₹32 - ₹36',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Copper Wire (Bare Bright)',
    icon: 'Layers',
    image: 'https://loremflickr.com/400/300/copper,wire?lock=10',
    desc: 'Clean, unalloyed, uncoated copper wire scrap.',
    badge: 'metal-badge',
    badgeText: 'Metals & Alloys',
    rate: '₹650 - ₹720',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Brass Scrap',
    icon: 'Music',
    image: 'https://loremflickr.com/400/300/brass,scrap?lock=11',
    desc: 'Mixed brass castings, turnings, and old plumbing fixtures.',
    badge: 'metal-badge',
    badgeText: 'Metals & Alloys',
    rate: '₹400 - ₹450',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Aluminium Extrusion',
    icon: 'Maximize2',
    image: 'https://loremflickr.com/400/300/aluminium,scrap?lock=12',
    desc: 'Clean aluminium window frames and structural extrusions.',
    badge: 'metal-badge',
    badgeText: 'Metals & Alloys',
    rate: '₹140 - ₹170',
    unit: 'per kg',
    hot: true,
    active: true
  },
  {
    name: 'Stainless Steel (SS 304)',
    icon: 'Shield',
    image: 'https://loremflickr.com/400/300/stainless,steel?lock=13',
    desc: 'Non-magnetic stainless steel scrap from kitchen or industry.',
    badge: 'metal-badge',
    badgeText: 'Metals & Alloys',
    rate: '₹110 - ₹130',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Lead Scrap',
    icon: 'Anchor',
    image: 'https://loremflickr.com/400/300/lead,metal?lock=14',
    desc: 'Soft lead scrap, pipes, and weights.',
    badge: 'metal-badge',
    badgeText: 'Metals & Alloys',
    rate: '₹120 - ₹140',
    unit: 'per kg',
    hot: false,
    active: true
  },
  {
    name: 'Zinc Scrap',
    icon: 'Coins',
    image: 'https://loremflickr.com/400/300/zinc,scrap?lock=15',
    desc: 'Die cast zinc scrap from automotive and plumbing.',
    badge: 'metal-badge',
    badgeText: 'Metals & Alloys',
    rate: '₹150 - ₹180',
    unit: 'per kg',
    hot: false,
    active: true
  }
];

async function seed() {
  console.log('Fetching categories...');
  const catSnap = await db.collection('scrap_categories').get();
  const catDocs = catSnap.docs.map(d => ({ id: d.id, name: d.data().label }));

  for (const prod of products) {
    let catId = '';
    const catName = prod.badgeText === 'Metals & Alloys' ? 'Metals & Alloys' : prod.badgeText;
    const cat = catDocs.find(c => c.name === catName);
    if (cat) catId = cat.id;

    // Delete existing products with same name to avoid duplicates
    const existSnap = await db.collection('scrap_products').where('name', '==', prod.name).get();
    for (const doc of existSnap.docs) {
      await doc.ref.delete();
    }

    await db.collection('scrap_products').add({
      ...prod,
      categoryId: catId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Added product ${prod.name}`);
  }
  
  // also add images to the existing 3 products
  const existSnap1 = await db.collection('scrap_products').where('name', '==', 'End-of-Life Cars').get();
  for (const doc of existSnap1.docs) await doc.ref.update({ image: 'https://loremflickr.com/400/300/car,junk?lock=16' });
  const existSnap2 = await db.collection('scrap_products').where('name', '==', 'Heavy Machinery').get();
  for (const doc of existSnap2.docs) await doc.ref.update({ image: 'https://loremflickr.com/400/300/excavator,scrap?lock=17' });
  const existSnap3 = await db.collection('scrap_products').where('name', '==', 'Mixed Ferrous').get();
  for (const doc of existSnap3.docs) await doc.ref.update({ image: 'https://loremflickr.com/400/300/iron,scrap?lock=18' });

  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
