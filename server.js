try {
  Object.entries(require('./secrets.js')).forEach(([key, value])=> {
    process.env[key] = value;
  });
}
catch(ex){
  console.log(ex);
}
const Sequelize = require('sequelize');
const { STRING, DECIMAL, BOOLEAN } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');

const Restaurant = conn.define('restaurants', {
  name: STRING,
  lat: DECIMAL, 
  lng: DECIMAL,
  isFavorite: {
    type: BOOLEAN,
    defaultValue: true
  } 
});

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  await Promise.all(require('./restaurants').map(({ name, place: { location: [ lng, lat]} }) => {
    return Restaurant.create({
      name,
      lat,
      lng
    });
  }));
};

const path = require('path');
const express = require('express');
const app = express();
app.engine('html', require('ejs').renderFile);
app.use(express.json());

app.get('/', (req, res, next)=> {
  res.render(path.join(__dirname, 'index.html'), {
    MAP_API_KEY: process.env.MAP_API_KEY
  });
});

app.get('/api/restaurants', async(req, res, next)=> {
  try {
    res.send(await Restaurant.findAll({ order: [['name']]}));
  }
  catch(ex){
    next(ex);
  }
});

app.put('/api/restaurants/:id', async(req, res, next)=> {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    await restaurant.update(req.body);
    res.send(restaurant);
  }
  catch(ex){
    next(ex);
  }
});

const init = ()=> {
  syncAndSeed();
  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();
