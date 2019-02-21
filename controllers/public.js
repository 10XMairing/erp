
const db= require('../util/database');


exports.home = (req, res, next) => {
  db.execute('SELECT * FROM login')
    .then(([rows, fieldData]) => {
      console.log(rows);
      res.render('index', {
        data: rows,
        pageTitle: 'ERP Home',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};