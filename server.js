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

const Place = conn.define('place', {
  name: STRING,
  lat: DECIMAL, 
  lng: DECIMAL,
  isFavorite: {
    type: BOOLEAN,
    defaultValue: false
  } 
});

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  await Promise.all(require('./places').map(({ isFavorite, name, location: [ lng, lat] }) => {
    return Place.create({
      name,
      lat,
      lng,
      isFavorite
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


app.get('/api/places', async(req, res, next)=> {
  try {
    res.send(await Place.findAll({ order: [['lat', 'desc']]}));
  }
  catch(ex){
    next(ex);
  }
});

app.put('/api/places/:id', async(req, res, next)=> {
  try {
    const place = await Place.findByPk(req.params.id);
    await place.update(req.body);
    res.send(place);
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
