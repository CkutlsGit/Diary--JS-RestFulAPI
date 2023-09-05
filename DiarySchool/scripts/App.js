const express = require('express');
const path = require('path');

const App = express();

App.use('/src', express.static(path.join(__dirname, '../src')));
App.use(express.urlencoded({ extended: true }));

const { Main } = require('./Mainrouter')
const MainRouter = new Main(App);
MainRouter.install();

const { Admin } = require('./Adminrouter');
const AdminRouter = new Admin(App);
AdminRouter.install();

const { Diary } = require('./Diaryrouter');
const DiaryRouter = new Diary(App);
DiaryRouter.install();

App.listen(3000, () => {
    console.log('Server start on http://localhost:3000');
});
