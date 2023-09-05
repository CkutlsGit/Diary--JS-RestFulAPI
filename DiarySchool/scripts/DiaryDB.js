const sqlite3 = require('sqlite3');
const path = require('path');
const { log } = require('console');

const dbPath = path.join(__dirname, '../src/db/userdiary.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(`Ошибка при открытии базы данных: ${err.message}`);
    } else {
        console.log('База данных успешно открыта');
    }
});

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS userdiary(
            id INTEGER PRIMARY KEY,
            login TEXT,
            post TEXT,
            rus TEXT DEFAULT '',
            math TEXT DEFAULT ''
        )
    `;
    db.run(sql);
});

class  Diary { // Сделать метод проверки есть ли уже зарегистрирован дневник, если зареган то не добавляет и ошибку пишет, в ином случае по другому
    static create(login, post, cb) {

        if (!login || !post) return cb('Ошибка с data!', null);

        Diary.checkreg(login, (err, data) => {
            if (err) return cb(err);

            const sql = 'INSERT INTO userdiary (login, post) VALUES (?, ?)';
            db.run(sql, [login, post], (err) => {
                if (err) return cb(err);
                cb(null, 'Успешно');
            });
        });
    };

    static checkreg(login, cb) {
        db.get('SELECT * FROM userdiary WHERE login = ?', login, (err, data) => {
            if (err) return cb(err);

            if (data) return  cb('У вас уже создан аккаунт!');
            cb(null, data);
        });
    };

    static find(login, cb) {
      db.get('SELECT * FROM userdiary WHERE login = ?', login, (err, data) => {
          if (err) return cb(err);

          if (!data) return cb('Зарегистрируйте дневник!', null);

          cb(null, data);
      });
    };

    static findteacher(login, post, cb) {
        db.get('SELECT * FROM userdiary WHERE login = ? AND post = ?', login, post, (err, data) => {
            if (err) return cb(err, null);

            if (!data) return cb('Зарегистрируйте дневник!');

            if (data.post !== 'teacher' && data.post !== 'admin') return cb('Вы не имеете прав заходить на данную страницу', null);

            Diary.find(login, (err) => {
               if (err) return cb(err);

                cb(null, 'Подходите!');
            });
        });
    };

    static getall(cb) {
        db.all('SELECT * FROM userdiary', (err, rows) => {
            if (err) return cb(err);

            cb(null, rows);
        })
    };

    static getsome(id, cb) {
      db.get('SELECT * FROM userdiary WHERE id = ?', id, (err, data) => {
         if (err) return cb(err);

         cb(null, data);
      });
    };

    static  getsomelogin(login, cb) {
        db.get('SELECT * FROM userdiary WHERE login = ?', login, (err, data) => {
            if (err) return cb(err);

            cb(null, data);
        })
    };

    static updmath(id, num, cb) {
        db.get('SELECT math FROM userdiary WHERE id = ?', id, (err, data) => {
            if (err) return cb(err);

            const currentMath = data.math || '';
            const newMath = currentMath + ' ' + num;

            const sql = 'UPDATE userdiary SET math = ? WHERE id = ?';
            db.run(sql, [newMath, id], (err) => {
                if (err) return cb(err);

                cb(null);
            });
        });
    };

    static updrus(id, num, cb) {
        db.get('SELECT rus FROM userdiary WHERE id = ?', id, (err, data) => {
            if (err) return cb(err);

            const currentRus = data.rus || '';
            const newRus = currentRus + ' ' + num;

            const sql = 'UPDATE userdiary SET rus = ? WHERE id = ?';
            db.run(sql, [newRus, id], (err) => {
                if (err) return cb(err);

                cb(null);
            });
        });
    };

    static averagemark(id, cb) {
        db.get('SELECT math, rus FROM userdiary WHERE id = ?', id, (err, data) => {
            if (err) return cb(err);

            if (!data) return cb('Зарегистрируйте дневник!', null);

            const mathMarks = data.math ? data.math.trim().split(' ').map(Number) : [];
            const rusMarks = data.rus ? data.rus.trim().split(' ').map(Number) : [];

            const calcAverage = (marks) => {
                if (marks.length === 0) return 0;
                const sum = marks.reduce((acc, mark) => acc + mark, 0);
                return sum / marks.length;
            };

            const mathAverage = calcAverage(mathMarks);
            const rusAverage = calcAverage(rusMarks);

            const endMarks = {
                math: mathAverage.toFixed(2),
                rus: rusAverage.toFixed(2)
            };

            cb(null, endMarks);
        });
    };
}

module.exports = Diary