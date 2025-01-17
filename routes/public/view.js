
const db = require('../../connectors/db');

module.exports = function(app) {
  //Register HTTP endpoint to render /index page
  app.get('/', function(req, res) {
    console.log("view 1")
    return res.render('index');
  });
// example of passing variables with a page
  app.get('/register', async function(req, res) {
    console.log("view 2")
    const stations = await db.select('*').from('se_project.stations');
    return res.render('register', { stations });
  });
};
