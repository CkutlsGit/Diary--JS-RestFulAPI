const UserData = require('./UsersDB');
const session = require('express-session');
const ejs = require('ejs');
const path = require('path');

class Main {
    constructor(App) {
        this.App = App;
        this.App.use(session({
            secret: '673d1g9d07f814630e3fb097c782ff86a02eef184f6715c6e62c4d492d70bf50',
            resave: false,
            saveUninitialized: true
        }));
    };

    install() {
        this.RegdataPage();
        this.RegdataMethod();
        this.AuthPage();
        this.AuthMethod();
    };

    RegdataPage() {
        this.App.get('/', (req, res, next) => {
            const RegPage = path.join(__dirname, '../src/styles/templates/html/regpage.html');
            res.sendFile(RegPage);
        });
    };

    RegdataMethod() {
        this.App.post('/', (req, res, next) => {
            const { login, password, post } = req.body;
        
            const RegcompletePage = path.join(__dirname, '../src/styles/templates/html/regcomplete.html');
        
            UserData.register({ login, password, post }, (err, data) => {
                if (err) {
                    const isError = err;
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 
        
                    res.render(ErrorPage, { error: isError });
                } 
                else {
                    res.sendFile(RegcompletePage);
                }
            });
        });        
    };

    AuthPage() {
        this.App.get('/auth', (req, res, next) => {
            const AuthPage = path.join(__dirname, '../src/styles/templates/html/authpage.html');
            res.sendFile(AuthPage);
        });
    };

    AuthMethod() {
        this.App.post('/auth', (req, res, next) => {
            const { login, password } = req.body;
            const confirmUser = 'confirm';

            UserData.auth(login, password, (err, data) => {
                if (err) {
                    const isError = err;
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                    return res.render(ErrorPage, { error: isError });
                }

                UserData.confirmed(login, confirmUser, (err, data) => {
                    if (err) {
                        const isError = err;
                        const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                        return res.render(ErrorPage, { error: isError });
                    }
                    else {
                        if (!data) {
                            const isError = 'Ваш аккаунт не подтвержден или не найден!';
                            const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                            return res.render(ErrorPage, { error: isError });
                        }

                        const post = data.post;

                        req.session.login = login;
                        req.session.post = post;
                        req.session.isLoggedIn = true;

                        const AuthcompletePage = path.join(__dirname, '../src/styles/templates/ejs/authcomplete.ejs');
                        res.render(AuthcompletePage, { login: req.session.login });
                    }
                });
            })
        });
    };
}

module.exports.Main = Main;