const sqlite3 = require('sqlite3');
const path = require('path');
const { log } = require('console');

const dbPath = path.join(__dirname, '../src/db/userdata.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(`Ошибка при открытии базы данных: ${err.message}`);
    } else {
        console.log('База данных успешно открыта');
    }
});

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS userdata(
            id INTEGER PRIMARY KEY,
            login TEXT,
            password TEXT,
            post TEXT,
            confirm TEXT DEFAULT 'noconfirm'
        )
    `;
    db.run(sql);
});

class UserSend {
    static find(login, cb) {
        db.get('SELECT * FROM userdata WHERE login = ?', login, cb);
    };

    static findadmin(login, post, cb) {
        const confirmPost = 'admin'
        db.get('SELECT * FROM userdata WHERE login = ? AND post = ?', [login, post], (err, data) => {
            if (err) return cb(err);

            if (post !== confirmPost) {
                return cb('Страница только для администрации!');
            }

            return cb(null, data || null);
        });
    };

    static getall(cb) {
        db.all('SELECT * FROM userdata', (err, rows) => {
            if (err) return cb(err);
    
            cb(null, rows);
        });
    };

    static getuserlogin(login, cb) {
        db.get('SELECT * FROM userdata WHERE login = ?', login, (err, data) => {
           if (err) return cb(err);

           cb(null, data);
        });
    };

    static delete(id, cb) {
        db.run('DELETE FROM userdata WHERE id = ?', id, (err) => {
            if (err) return cb(err);
    
            cb(null);
        });
    };
    
    static checklogin(login, cb) {
        db.get('SELECT COUNT(*) as count FROM userdata WHERE login = ?', login, (err, row) => {
            if (err) return cb(err);

            const Freelogin = row.count === 0;
            cb(null, Freelogin);
        });
    };

    static emptyinputs(login, password, cb) {
        const empty = /\s/;
        db.get('SELECT * FROM userdata WHERE login = ? AND password = ?', (login, password), (err, data) => {
            if (err) return cb(err);

            if (empty.test(login) || empty.test(password)) {
                return cb('Логин или пароль не должен содержать пробелы!');
            }

            cb(null, data);
        });
    };

    static nolatin(login, password, cb) {
        db.get('SELECT * FROM userdata WHERE login = ? AND password = ?', (login, password), (err, data) => {
            if (err) return cb(err);

            const russianSim = /[а-яё]/i;

            if (russianSim.test(login) || russianSim.test(password)) {
                return cb('Логин или пароль не должен содержать русских символов!');
            }
            
            cb(null, data);
        });
    };

    static register(data, cb) {
        const { login, password, post } = data;
    
        UserSend.checklogin(login, (err, Freelogin) => {
            if (err) return cb(err);
    
            if (!Freelogin) {
                return cb('Логин занят!');
            }
    
            UserSend.emptyinputs(login, password, (err) => {
                if (err) return cb(err);
    
                UserSend.nolatin(login, password, (err, data) => {
                    if (err) return cb(err);

                    const sql = 'INSERT INTO userdata (login, password, post) VALUES (?, ?, ?)';
                    db.run(sql, [login, password, post], (err) => {
                        if (err) return cb(err);
                        cb(null);
                    });
                });
            });
        });
    };
    
    static auth(login, password, cb) {
        db.get('SELECT * FROM userdata WHERE login = ? AND password = ?', [login, password], (err, data) => {
            if (err) return cb(err);

            if (!data) {
                return cb('Ошибка при вводе данных, проверьте тщательно!', null);
            }

            cb(null, data);
        });
    };

    static confirmed(login, confirm, cb) {
        const confirmUser = 'confirm';

        db.get('SELECT * FROM userdata WHERE login = ? AND confirm = ?', [login, confirmUser], (err, data ) => {
            if (err) return cb(err);

            if (confirm !== confirmUser) {
                return cb('Ваша учетная запись не подтверждена!', null);
            }

            cb(null, data);
        });
    };

    static confirmuser(id, cb) {
        const isConfirmed = 'confirm';
        const sql = 'UPDATE userdata SET confirm = ? WHERE id = ? AND confirm != ?';
    
        db.run(sql, [isConfirmed, id, isConfirmed], (err) => {
            if (err) return cb(err);
    
            cb(null);
        });
    };    
}

module.exports = UserSend;