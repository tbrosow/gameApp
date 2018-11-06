const express = require('express')
var parser = require('body-parser');

const app = express()
app.use(express.static('/Users/Torsten/Programs/nodesql/gamesApp'));
app.use(parser.urlencoded({
    extended: false
}))
app.use(parser.json())

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 100, //important
    host: 'localhost',
    user: 'db',
    password: '5QLXxNCDel6jYgYx',
    database: 'Norman',
    debug: false
});

var games = {
    games: 1
};

app.set('view engine', 'ejs')

app.get('/', function(req, res) {
    res.render('index');
})

app.get('/game', function(req, res) {
    getVote(req, res);
})

app.post('/game', function(req, res) {
    saveVote(req, res);
})

app.post('/games', function(req, res) {
    updateGame(req, res);
})

app.get('/games', function(req, res) {
    getGames(req, res);
})
app.get('/stats', function(req, res) {
    if (!req.query.game)
        req.query.game = 1;
    getResult(req, res);
})

app.get('/players', function(req, res) {
    res.render('players');
})

app.listen(8080, function() {
    console.log('Example app listening on port 8080!')
})

function getResult(req, res) {

    
    var data = {
        game: {}
    };

    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        }

        connection.query("select * from games", function(err, rows) {
            if (!err) {
                var games = {};
                console.log('ret SQL ' + JSON.stringify(rows));
                console.log('Selected' + rows[0].Number);
                data.games = rows;
            } else {
                console.log('SQL Error: ' + err);
            }

            connection.query("select * from games where Number = ?", [req.query.game], function(err, rows) {
                if (!err) {
                    var games = {};
                    console.log('ret SQL ' + JSON.stringify(rows));
                    console.log('Selected' + rows[0].Number);
                    data.game.Number = rows[0].Number;
                    data.game.Location = rows[0].Location;
                    data.game.Result = rows[0].Result;
                } else {
                    console.log('SQL Error: ' + err);
                }

                connection.query("select * from players", function(err, rows) {
                    if (!err) {
                        console.log('ret SQL ' + JSON.stringify(rows));
                        console.log('Selected' + rows[0].Number);
                        data.players = rows;
                    } else {
                        console.log('SQL Error: ' + err);
                    }

                    connection.query("select * from vote", function(err, rows) {
                        if (!err) {
                            console.log('ret SQL ' + JSON.stringify(rows));
                            data.vote = rows;
                        } else {
                            console.log('SQL Error: ' + err);
                        }

                        console.log('data: ' + JSON.stringify(data));
                        res.render('stats', {
                            game: data.game,
                            vote: data.vote,
                            players: data.players,
                            games: data.games
                        });

                    });

                });
            });

        });

    });
}

function saveVote(req, res) {

    var data = {
        game: {
            Number: 0
        },
        xx: "D"
    };

    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        }

        console.log('Voter ' + req.body.Voter);
        console.log('GameNumber ' + req.body.GameNumber);
        console.log('gold ' + req.body.gold);
        console.log('played ' + req.body.played);

        if (req.body.played == "played") {
            connection.query("INSERT INTO vote (Player, Game, gold, silver, bronze) VALUES (?,?,?,?,?);", [req.body.Voter, req.body.GameNumber, req.body.gold, req.body.silver, req.body.bronze], function(err, result) {

                if (!err) {
                    var games = {};
                    console.log('ret SQL ' + JSON.stringify(result));
                    console.log("SQL: " + result.affectedRows + " record(s) inserted");
                } else {
                    console.log('SQL Error: ' + err);
                }
            });
        } else {
            connection.query("INSERT INTO vote (Player, Game) VALUES (?,?);", [req.body.Voter, req.body.GameNumber, req.body.gold, req.body.silver, req.body.bronze], function(err, result) {

                if (!err) {
                    var games = {};
                    console.log('ret SQL ' + JSON.stringify(result));
                    console.log("SQL: " + result.affectedRows + " record(s) inserted");
                } else {
                    console.log('SQL Error: ' + err);
                }
            });

        }
        connection.query("select * from games where Number = ?", [req.body.GameNumber], function(err, rows) {
            if (!err) {
                // res.json(rows);
                var games = {};
                console.log('ret SQL ' + JSON.stringify(rows));
                console.log('Selected' + rows[0].Number);
                data.game.Number = rows[0].Number;
                data.game.Location = rows[0].Location;
                data.game.Result = rows[0].Result;
            } else {
                console.log('SQL Error: ' + err);
            }

            console.log('data2 ' + JSON.stringify(data));

            connection.query("select * from players", function(err, rows) {
                if (!err) {

                    console.log('ret SQL ' + JSON.stringify(rows));
                    console.log('Selected' + rows[0].Number);
                    data.players = rows;
                } else {
                    console.log('SQL Error: ' + err);
                }
                console.log('data3 ' + JSON.stringify(data));

                connection.query("select * from vote", function(err, rows) {
                    if (!err) {

                        console.log('ret SQL ' + JSON.stringify(rows));
                        data.vote = rows;
                    } else {
                        console.log('SQL Error: ' + err);
                    }

                    console.log('data: ' + JSON.stringify(data));
                    res.render('game', {
                        game: data.game,
                        vote: data.vote,
                        players: data.players
                    });

                });

            });

        });

    });
}

function getVote(req, res) {

    var data = {
        game: {
            Number: 0
        },
        xx: "D"
    };

    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        }

        connection.query("select * from games where Number = ?", [req.query.game], function(err, rows) {
            if (!err) {
                var games = {};
                console.log('ret SQL ' + JSON.stringify(rows));
                data.game.Number = rows[0].Number;
                data.game.Location = rows[0].Location;
                data.game.Result = rows[0].Result;
            } else {
                console.log('SQL Error: ' + err);
            }

            connection.query("select * from players", function(err, rows) {
                if (!err) {
                    console.log('ret SQL ' + JSON.stringify(rows));
                    data.players = rows;
                } else {
                    console.log('SQL Error: ' + err);
                }

                connection.query("select * from vote", function(err, rows) {
                    if (!err) {
                        console.log('ret SQL ' + JSON.stringify(rows));
                        data.vote = rows;
                    } else {
                        console.log('SQL Error: ' + err);
                    }

                    console.log('data: ' + JSON.stringify(data));
                    res.render('game', {
                        game: data.game,
                        vote: data.vote,
                        players: data.players
                    });

                });

            });

        });
    });
}

function updateGame(req, res) {

    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        }

        console.log('Location ' + req.body.Location);
        console.log('Number ' + req.body.Number);
        console.log('CurrentGame ' + req.body.CurrentGame);
        console.log('Home ' + req.body.Home);

        console.log('CurrentGame ' + req.body.CurrentGame);
        connection.query("UPDATE games SET CurrentGame='No'", function(err, result) {

            if (!err) {
                var games = {};
                console.log('ret SQL ' + JSON.stringify(result));
                console.log("Update: " + result.affectedRows + " record(s) updated");
            } else {
                console.log('SQL Error: ' + err);
            }
        });

        connection.query("UPDATE games SET Location=?, Home=?, CurrentGame=? WHERE Number=?", [req.body.Location, req.body.Home, req.body.CurrentGame, req.body.Number], function(err, result) {

            if (!err) {
                var games = {};
                console.log('ret SQL ' + JSON.stringify(result));
                console.log("Update: " + result.affectedRows + " record(s) updated");
            } else {
                console.log('SQL Error: ' + err);
            }
        });

        connection.query("select * from games", function(err, rows) {
            connection.release();
            if (!err) {
                var games = {};
                console.log('ret SQL ' + JSON.stringify(rows));
                res.render('games', {
                    games: rows
                });
            } else {
                console.log('SQL Error: ' + err);
            }
        });

    });
}

function getGames(req, res) {

    pool.getConnection(function(err, connection) {
        if (err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query("select * from games", function(err, rows) {
            connection.release();
            if (!err) {
                var games = {};
                res.render('games', {
                    games: rows
                });
            }
        });

        connection.on('error', function(err) {
            res.json({
                "code": 100,
                "status": "Error in connection database"
            });
            return;
        });
    });
}