const UserDiary = require('./DiaryDB');
const session = require('express-session');
const ejs = require('ejs');
const path = require('path');

class  Diary {
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
            }
            next();
        });
    };

    install() {
        this.DiaryPage();
        this.DiaryMethod();
        this.DiarymainPage();
        this.DiaryteacherPage();
        this.DiaryplacemarksMethod();
        this.DiaryusersmarksPage();
        this.DiaryuserendmarksPage();
    };

    DiaryPage() {
        this.App.get('/diary', (req, res, next) => {
            if (!req.user) {
                const isError = 'Сначало войдите в аккаунт!';
                const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                return res.render(ErrorPage, { error: isError });
            }

            UserDiary.getsomelogin(req.user.login, (err, data) => {
               if (err) {
                   const isError = err;
                   const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                   return res.render(ErrorPage, { error: isError });
               }

                const Diarypage = path.join(__dirname, '../src/styles/templates/ejs/diarypage.ejs');
                res.render(Diarypage, { user: req.user.login } );
            });
        });
    };

    DiaryMethod() {
      this.App.post('/diary', (req, res, next) => {
         const userId = req.user.login;

         UserDiary.create(userId, req.user.post, (err) => {
             if (err) {
                 const isError = err;
                 const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                return res.render(ErrorPage, { error: isError });
             }

             res.redirect('/diary/main');
         });
      });
    };

    DiarymainPage() {
      this.App.get('/diary/main', (req, res, next) => {
          if (!req.user) {
              const isError = 'Сначало войдите в аккаунт!';
              const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

              return res.render(ErrorPage, { error: isError });
          }

          UserDiary.find(req.user.login, (err, data) => {
              if (err) {
                  const isError = err;
                  const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                  return res.render(ErrorPage, { error: isError });
              }

              const Datauserid = data.id;

              UserDiary.getall((err, users) => {
                  if (err) {
                      const isError = err;
                      const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                      return res.render(ErrorPage, { error: isError });
                  }

                  const Diarymainpage = path.join(__dirname, '../src/styles/templates/ejs/diarymainpage.ejs');
                  res.render(Diarymainpage, { login: req.user.login, post: req.user.post, id: Datauserid, user: users });
              });
          });
      });
    };

    DiaryteacherPage() {
        this.App.get('/diary/main/teacher', (req, res, next) => {
            const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

            if (!req.user) {
                return res.render(ErrorPage, { error: 'Сначало войдите в аккаунт!' });
            }

            UserDiary.findteacher(req.user.login, req.user.post, (err, data) => {
                if (err) {
                    const isError = err;
                    const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                    return res.render(ErrorPage, { error: isError });
                }

                UserDiary.getall((err, users) => {
                    if (err) {
                        const isError = err;
                        const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                        return res.render(ErrorPage, { error: isError });
                    }

                    const Diaryteacherpage = path.join(__dirname, '../src/styles/templates/ejs/diaryteacherpage.ejs');
                    res.render(Diaryteacherpage, { users: users, login: req.user.login });
                });
            })
        });
    };

    DiaryplacemarksMethod() {
      this.App.post('/diary/main/teacher/markplace/:id', (req, res, next) => {
         const userId = req.params.id;
         const mark = req.body.markplace;

         const object = req.body.object;

          if (object === 'rus') {
              UserDiary.updrus(userId, mark, (err) => {
                  if (err) {
                      const isError = err;
                      const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                      return res.render(ErrorPage, { error: isError });
                  }

                  res.redirect('/diary/main/teacher');
              });
          }
          else if (object === 'math') {
              UserDiary.updmath(userId, mark, (err) => {
                  if (err) {
                      const isError = err;
                      const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                      return res.render(ErrorPage, { error: isError });
                  }

                  res.redirect('/diary/main/teacher');
              });
          }
          else {
              const isError = 'Ошибка при выставлении оценки!';
              const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

              return res.render(ErrorPage, { error: isError });
          }
      });
    };

    DiaryusersmarksPage() {
        this.App.get('/diary/main/marks/:id', (req, res, next) => {
           const userId = req.params.id;

           if (!req.user) {
               const isError = 'Сначало войдите в аккаунт!';
               const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

               return res.render(ErrorPage, { error: isError });
           }

           UserDiary.find(req.user.login, (err) => {
               if (err) {
                   const isError = err;
                   const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                   return res.render(ErrorPage, { error: isError });
               }

               UserDiary.getsome(userId, (err, data) => {
                   if (err) {
                       const isError = err;
                       const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                       return res.render(ErrorPage, { error: isError });
                   }

                   const Diaryuserpage = path.join(__dirname, '../src/styles/templates/ejs/diaryuserpage.ejs');
                   res.render(Diaryuserpage, { user: data });
               })
           });
        });
    };

    DiaryuserendmarksPage() {
        this.App.get('/diary/main/endmarks/:id', (req, res, next) => {
            const userId = req.params.id;

            UserDiary.averagemark(userId, (err, endMarks) => {
               if (err) {
                   const isError = err;
                   const ErrorPage = path.join(__dirname, '../src/styles/templates/ejs/errorpage.ejs');

                   return res.render(ErrorPage, { error: isError });
               }

               const Diaryuserendmarkpage = path.join(__dirname, '../src/styles/templates/ejs/diaryuserendmarkpage.ejs');
               res.render(Diaryuserendmarkpage, { endmarks: endMarks });
            });
        });
    };
}

module.exports.Diary = Diary;