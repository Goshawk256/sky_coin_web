    const mysql = require("mysql");
    const express = require("express");
    const bodyParser = require("body-parser");
    const path=require('path');

    const app = express();

    app.use(express.static(path.join(__dirname, 'web_proje', 'web_sitesi', 'public')));



    const enCoder = bodyParser.urlencoded({ extended: true });

    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",   
        database: "site_veritabani"
    });

    connection.connect(function(error) {
        if(error) {
            throw error;
        } else {
            console.log("Bağlantı başarıyla kuruldu!");
        }
    });


    app.get("/giris", function(req, res) {
        res.sendFile(__dirname + "/giriş.html");
    });

    app.get("/anasayfa", function(req, res) {
        res.sendFile(__dirname + "/index.html");
    });
    app.get("/kayit", function(req, res) {
        res.sendFile(__dirname + "/kaydol.html");
    });
    app.get("/oynakazan", function(req, res) {
        res.sendFile(__dirname + "/oynakazan.html");
    });
    app.get("/sat", function(req, res) {
        res.sendFile(__dirname + "/sat.html");
    });
    app.get("/al", function(req, res) {
        res.sendFile(__dirname + "/al.html");
    });
    app.get("/hafizakarti", function(req, res) {
        res.sendFile(__dirname + "/Hafıza Kartı.html");
    });
    app.get("/adamasmaca", function(req, res) {
        res.sendFile(__dirname + "/Adam Asmaca.html");
    });
    app.get("/Tam12den", function(req, res) {
        res.sendFile(__dirname + "/Tam 12'den.html");
    });
    app.get("/piyasalar", function(req, res) {
        res.sendFile(__dirname + "/piyasalar.html");
    });
    app.get("/kisiselpanel", function(req, res) {
        res.sendFile(__dirname + "/giris_basarili.html");
    });
    app.get("/log_piyasa", function(req, res) {
        res.sendFile(__dirname + "/login_piyasa.html");
    });
    app.get("/log_sat", function(req, res) {
        res.sendFile(__dirname + "/login_sat.html");
    });
    app.get("/log_al", function(req, res) {
        res.sendFile(__dirname + "/login_al.html");
    });
    app.get("/log_12den", function(req, res) {
        res.sendFile(__dirname + "/login_12den.html");
    });
    app.get("/log_asmaca", function(req, res) {
        res.sendFile(__dirname + "/login_asmaca.html");
    });
    app.get("/log_hkarti", function(req, res) {
        res.sendFile(__dirname + "/login_hkarti.html");
    });
    app.get("/log_kazan", function(req, res) {
        res.sendFile(__dirname + "/login_oynakazan.html");
    });
    app.get("/log_anasayfa", function(req, res) {
        res.sendFile(__dirname + "/login_anasayfa.html");
    });

    app.get("/wallet", function(req, res) {
        res.sendFile(__dirname + "/cüzdan.html");
    });

    app.get("/goster", function(req, res) {
        connection.query('SELECT uye_adi ,bnm ,ane ,try ,cte, xnj ,fex, atm  FROM uyeler WHERE is_active = true', (error, results, fields) => {
            if (error) throw error;
            res.json(results);
        });
    });
    


app.get('/bilgilerim', (req, res) => {
    connection.query('SELECT uye_adi, uye_soyadi, uye_eposta FROM uyeler WHERE is_active = true', (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
});



    app.post("/submit_login", enCoder, function(req, res) {
        var email = req.body.email;
        var password = req.body.şifre;
        connection.query("SELECT * FROM uyeler WHERE uye_eposta = ? AND uye_sifre = ?", [email, password], function(error, results, fields) {
            if(error) {
                throw error;
            }
            if(results.length > 0) {
                var uye_id = results[0].uye_id; // Giriş yapan kullanıcının uye_id'sini al
                // Kullanıcının sadece kendi uye_id'sine sahip olduğu sütunu TRUE olarak güncelle
                connection.query("UPDATE uyeler SET is_active = TRUE WHERE uye_id = ?", [uye_id], function(updateError, updateResults, updateFields) {
                    if(updateError) {
                        throw updateError;
                    }
                    res.sendFile(__dirname + "/login_anasayfa.html");
                });
            } else {
                res.send("Giriş başarısız! E-posta veya şifre yanlış.");
            }
        });
    });
    
    app.post("/submit_registration", enCoder, function(req, res) {
        var uye_adi = req.body.fname;
        var uye_soyadi = req.body.lname;
        var uye_telno = req.body.telefon;
        var uye_eposta = req.body.email;
        var uye_sifre = req.body.şifre;

        connection.query("INSERT INTO uyeler (uye_adi, uye_soyadi, uye_telno, uye_eposta, uye_sifre) VALUES (?, ?, ?, ?, ?)", [uye_adi, uye_soyadi, uye_telno, uye_eposta, uye_sifre], function(error, results, fields) {
            if(error) {
                throw error;
            }
            res.sendFile(__dirname + "/giriş.html");
        });
    });

    app.post("/cikis", function(req, res) {
        connection.query("UPDATE uyeler SET is_active = FALSE", function(error, results, fields) {
            if(error) {
                throw error;
            }
            res.redirect("/anasayfa");
        });
    });

    app.post("/kazandin", function(req, res) {
        connection.query("UPDATE uyeler SET try = try + 10 WHERE is_active = TRUE", function(error, results, fields) {
            if(error) {
                throw error;
            }
            res.send("Puanlar güncellendi!");
        });
    });
    function getRandomValue(min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    app.post("/convert_money", enCoder, function(req, res) {
        // Veri var mı ve boş değil mi kontrolü
        if (!req.body.amount || req.body.amount.trim() === '') {
            res.status(400).send("Miktar belirtilmemiş veya geçersiz!");
            return;
        }
    
        const amount = parseFloat(req.body.amount);
        const moneyname = req.body.currency;
        let moneyvalue = 0; // let kullanarak değiştirdik
    
        if (moneyname == "BNM") {
            moneyvalue =amount*getRandomValue(21.60, 22.60);
        } else if (moneyname == "ANE") {
            moneyvalue = amount*getRandomValue(18.60, 19.60);
        } else if (moneyname == "CTE") {
            moneyvalue = amount*getRandomValue(0.23, 0.28);
        } else if (moneyname == "XNJ") {
            moneyvalue = amount*getRandomValue(6.30, 7.10);
        } else if (moneyname == "FEX") {
            moneyvalue = amount*getRandomValue(2.10, 2.50);
        } else if (moneyname == "ATM") {
            moneyvalue = amount*getRandomValue(11.20, 11.60);
        }
    
        if (isNaN(amount)) {
            res.status(400).send("Geçersiz miktar!");
            return;
        }
    
        connection.query("UPDATE uyeler SET try = try - ? WHERE is_active = TRUE", [amount], function(error, results, fields) {
            if (error) {
                throw error;
            }
            connection.query("UPDATE uyeler SET " + moneyname.toLowerCase() + " = " + moneyname.toLowerCase() + " + ? WHERE is_active = TRUE", [parseFloat(moneyvalue)], function(error, results, fields) {
                if (error) {
                    throw error;
                }
            });
            res.sendFile(__dirname + "/cüzdan.html");
        });
    });
    
    
    

    app.listen(5506);
