const UserData = require('./UsersDB');
const session = require('express-session');
const ejs = require('ejs');
const path = require('path');

class Admin {
    constructor(App) {
        this.App = App;
        this.App.use(session({
            secret: '673d1g9d07f814630e3fb097c782ff86a02eef184f6715c6e62c4d492d70bf50',
            resave: false,
            saveUninitialized: true
        }));

        this.App.use((req, res, next) => {
            if (req.session.isLoggedIn) {
                req.user = {
                    login: req.session.login,
                    post: req.session.post
                };
            };
            next();
        });
    };

    install() {
        this.AdminPage();
        this.AdminMethodconf();
        this.AdminMethodreject();
    };

    AdminPage() {
        this.App.get('/admin', (req, res, next) => {

            if (!req.user || !req.user.login || !req.user.post) {
                const isError = 'Войдите сперва в аккаунт';
                const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 
                
                return res.render(ErrorPage, { error: isError });
            }

            const login = req.user.login;
            const post = req.user.post;
    
            UserData.findadmin(login, post, (err, isAdmin) => {
                if (err) {
                    const isError = err;
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                    return res.render(ErrorPage, { error: isError });
                }
    
                if (!isAdmin) {
                    const isError = 'Страница только для администрации';
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                    return res.render(ErrorPage, { error: isError });
                }

                if (!login || !post) {
                    const isError = 'Не';
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                    return res.render(ErrorPage, { error: isError });
                }

                UserData.getall((err, users) => {
                    if (err) {
                        const isError = err;
                        const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 
    
                        res.render(ErrorPage, { error: isError });
                    }
                    else {
                        const AdminPage = path.join(__dirname, '../src/styles/templates/ejs/adminpage.ejs');
                        res.render(AdminPage, { users: users, adminlogin: login });
                    }
                });
            });
        });
    };

    AdminMethodconf() {
        this.App.post('/admin/confirm/:id', (req, res, next) => {
            const userId = req.params.id;
    
            UserData.confirmuser(userId, (err) => {
                if (err) {
                    const isError = err;
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 

                    res.render(ErrorPage, { error: isError });
                }
                else {
                    UserData.getall((err, users) => {
                        if (err) {
                            const isError = err;
                            const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 
        
                            res.render(ErrorPage, { error: isError });
                        }
                        else {
                            res.redirect('/admin');
                        }
                    });
                }
            });
        });
    };
    
    AdminMethodreject() {
        this.App.post('/admin/reject/:id', (req, res, next) => {
            const userId = req.params.id;
    
            UserData.delete(userId, (err) => {
                if (err) {
                    const isError = err;
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 

                    res.render(ErrorPage, { error: isError });
                }
                else {
                    UserData.getall((err, users) => {
                        if (err) {
                            const isError = err;
                            const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs'); 
        
                            res.render(ErrorPage, { error: isError });
                        }
                        else {
                            res.redirect('/admin');
                        }
                    });
                }
            });
        });
    }; 
}

module.exports.Admin = Admin;