const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const router = require('./router');
const redirect = require('./redirect');
const favicon = require('serve-favicon');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, '../public')));
app.use(favicon(path.join(__dirname, '../', 'public', 'favicon.ico')));

app.set('port', process.env.PORT || 3000);

app.use('/api/v1', router);
app.use('/', redirect);

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`Server is listening on ${app.get('port')}.`)
  });
}

module.exports = app;