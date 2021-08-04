const db = require('../database');
const mail = require('../mail');
const bcrypt = require("bcryptjs");
const functions = require('../functions');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config({
    path: './.env'
});


exports.home = async (req, res) => {
    try {
        db.query("SELECT * from blogs LIMIT 3", (error, blogs) => {
            if (error) {
                console.log(error);
            }
            else {
                db.query('select count(distinct city) as city, count(centre_id) as fitnessCentres from fitness_centres;', (err, cities) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        db.query('select count(*) as member from members where status=?', ["1"], (err, members) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                var a;
                                for (a = 0; a < blogs.length; a++) {
                                    blogs[a].date = functions.textdate(blogs[a].date);
                                }

                                return res.status(200).render('index', {
                                    blog: blogs,

                                    city: cities[0].city,
                                    centre: cities[0].fitnessCentres,
                                    member: members[0].member
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie("fitToken");
        db.query("SELECT * from blogs LIMIT 3", (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                return res.render('index', {
                    data: results
                });
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).render('LoginRegister/Login', {
                info: 'Provide Email and Password'
            });
        }
        else {
            db.query('select * from fitness_centres where username=?', [username], (error, results) => {
                if (error) {
                    console.log(error);
                }

                else {
                    if (results.length == 0) {
                        return res.status(401).render('LoginRegister/Login', {
                            warning: "Username Doesn't exist"
                        });
                    }
                    else {
                        bcrypt.compare(password, results[0].password, (err, re) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                if (!re) {
                                    return res.status(401).render('LoginRegister/Login', {
                                        danger: "Password is Incorrect"
                                    });
                                }
                                else {
                                    const centreid = results[0].centre_id;
                                    jwt.sign({ id: centreid }, process.env.fitToken, (err, token) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            res.cookie('fitToken', token);
                                            return res.status(200).render('User/home', (err) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc', [centreid], (err, result) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        else {
                                                            if (functions.convertdate(result[0].ending_date) <= functions.date()) {
                                                                return res.status(200).render('User/error', {
                                                                    text: "Your Subscription is over"
                                                                });
                                                            }
                                                            else {
                                                                db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?', [centreid], (err, result) => {
                                                                    if (err) {
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        if (result.length == 0) {
                                                                            db.query('select count(*) as count from members where centre_id=? ', [centreid], (err, membercount) => {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                }
                                                                                else {
                                                                                    db.query('select count(*) as count from members where centre_id=? and gender= ?', [centreid, "male"], (err, malecount) => {
                                                                                        if (err) {
                                                                                            console.log(err);
                                                                                        }
                                                                                        else {
                                                                                            db.query('select count(*) as count from members where centre_id=? and gender= ?', [centreid, "female"], (err, femalecount) => {
                                                                                                if (err) {
                                                                                                    console.log(err);
                                                                                                }
                                                                                                else {
                                                                                                    db.query('select count(*) as count from staff where centre_id=? ', [centreid], (err, staffcount) => {
                                                                                                        if (err) {
                                                                                                            console.log(err);
                                                                                                        }
                                                                                                        else {
                                                                                                            db.query('select count(*) as count from inventory where centre_id=? GROUP BY (category);', [centreid, "female"], (err, inventorycount) => {
                                                                                                                if (err) {
                                                                                                                    console.log(err);
                                                                                                                }
                                                                                                                else {
                                                                                                                    db.query('select count(*) as count from member_subscription where centre_id=? and date < ?', [centreid, functions.convertdate(functions.firstmonthdate(functions.date()))], (err, subscriptioncount) => {
                                                                                                                        if (err) {
                                                                                                                            console.log(err);
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            db.query('select * from members,member_subscription where members.member_id=member_subscription.member_id and members.centre_id=member_subscription.centre_id and members.centre_id=? and ending_date <= ?', [centreid, functions.adddate(functions.date(), 5)], (err, expiring) => {
                                                                                                                                if (err) {
                                                                                                                                    console.log(err);
                                                                                                                                }
                                                                                                                                else {
                                                                                                                                    db.query('select * from members,member_subscription where members.member_id=member_subscription.member_id and members.centre_id=member_subscription.centre_id and members.centre_id=?and ending_date < ?', [centreid, functions.date()], (err, ended) => {
                                                                                                                                        if (err) {
                                                                                                                                            console.log(err);
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                            return res.render('User/home', {
                                                                                                                                                membercount: membercount[0].count,
                                                                                                                                                malecount: malecount[0].count,
                                                                                                                                                femalecount: femalecount[0].count,
                                                                                                                                                staffcount: staffcount[0].count,
                                                                                                                                                inventorycount: inventorycount[0].count,
                                                                                                                                                subscriptioncount: subscriptioncount[0].count,
                                                                                                                                                expiring: expiring[0].count,
                                                                                                                                                ended: ended[0].count,
                                                                                                                                            })
                                                                                                                                        }
                                                                                                                                    })
                                                                                                                                }
                                                                                                                            })
                                                                                                                        }
                                                                                                                    })
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                        }
                                                                        else {
                                                                            return res.status(200).render('User/error', {
                                                                                text: "Get Best Fitness Management Experience With Us!!!!",
                                                                                text2: "Start by Filling your Profile"

                                                                            });
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    })
                                }
                            }
                        });
                    }
                }
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}

exports.register = async (req, res) => {
    try {
        const { name, email, username, password, confirmpassword } = req.body;

        if (!name || !email || !username || !password || !confirmpassword) {
            return res.status(400).render('LoginRegister/Register', {
                info: 'Provide all details'
            });
        }
        else {
            db.query("select * from fitness_centres where username = ? ", [username], async (err, results) => {
                if (err) {
                    console.log(err);
                }
                else {
                    if (results.length > 0) {
                        return res.status(400).render('LoginRegister/Register', {
                            info: 'Username Already Exists'
                        });
                    }
                    else {
                        if (password != confirmpassword) {
                            return res.status(400).render('LoginRegister/Register', {
                                info: "Password doesn't match"
                            });
                        }

                        else {
                            var hashedpassword = await bcrypt.hash(password, 10);

                            mail(email, "Your Login Details", `<h1>Thank you for choosing us!!!</h1><br><h2>username:${username}<br>password:${password}</h2>`);

                            db.query('insert into fitness_centres set ?', {
                                name: name,
                                centre_email: email,
                                username: username,
                                password: hashedpassword
                            }, (err, result) => {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    db.query('select centre_id from fitness_centres where username =?', [username], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            db.query('insert into fitness_centre_subscription set ?', {
                                                centre_id: result[0].centre_id,
                                                date: functions.date(),
                                                time: functions.time(),
                                                starting_date: functions.date(),
                                                ending_date: functions.adddate(functions.date(), 30),
                                            },
                                                (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                        return res.render('LoginRegister/Login', {
                                                            success: 'User Registered'
                                                        });
                                                    }
                                                })
                                        }
                                    })
                                }
                            }
                            );
                        }
                    }
                }
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}

exports.forget_password = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).render('forget-password', {
                info: 'Provide Details'
            });
        }
        else {
            db.query("select * from fitness_centres where username=?", [username], (error, result) => {
                if (error) {
                    console.log(error)
                }
                else {
                    if (result.length == 0) {
                        return res.status(401).render('forget-password', {
                            warning: "Invalid Details"
                        });
                    }
                    else {
                        var otpcode = functions.otpcode();
                        var id = result[0].centre_id;
                        jwt.sign({ otp: otpcode, id: id }, process.env.otptoken, (err, token) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                mail(result[0].centre_email, "Your Secret OTP ", `<h1>Your OTP : ${otpcode} </h1>`);
                                res.cookie('authToken', token);
                                return res.status(200).render('otp-authentication');
                            }
                        })
                    }
                }
            })
        }
    }
    catch (error) {
        console.log(error);
    }
}

exports.authentication = async (req, res) => {
    try {
        const { otp } = req.body;
        const otpcode = req.otp.otp;

        if (!otp) {
            return res.status(400).render('otp-authentication', {
                info: 'Enter OTP'
            });
        }
        else {
            if (otp != otpcode) {
                return res.status(401).render('otp-authentication', {
                    danger: "Wrong OTP."
                });
            }
            else {
                return res.status(200).render('change-password');
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

exports.change_password = async (req, res) => {
    try {
        const { password, confirmpassword } = req.body;
        const id = req.otp.id;

        if (!password || !confirmpassword) {
            return res.status(400).render('change-password', {
                info: 'Fill all the details'
            });
        }
        else {
            if (password != confirmpassword) {
                return res.status(401).render('change-password', {
                    warning: "Password Doesn't Match"
                });
            }
            else {
                let hashedpassword = await bcrypt.hash(password, 10);

                db.query('Update fitness_centres set password = ? where centre_id=?', [hashedpassword, id], (error, results) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        if (results.affectedRows == 0) {
                            return res.status(400).render('change-password', {
                                danger: "Something went wrong at our end. Kindly try again. If the problem persists, contact your library incharge."
                            });
                        }
                        else {
                            res.clearCookie("authToken");
                            return res.status(200).render('login', {
                                success: 'Password Updated'
                            });
                        }
                    }
                });
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

exports.centres = async (req, res) => {
    try {
        db.query("select * from fitness_centres,fitness_centre_subscription where fitness_centre_subscription.centre_id=fitness_centres.centre_id and fitness_centre_subscription.plan = ? and ending_date > ? GROUP BY fitness_centre_subscription.centre_id ORDER BY MAX(fitness_centre_subscription.subscription_id);", ["premium", functions.date()], (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                return res.status(200).render('Home/Centers', {
                    data: results
                });
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.portfolio = async (req, res) => {
    try {

    }
    catch (error) {
        console.log(error);
    }
}

exports.blogs = async (req, res) => {
    try {
        db.query('select * from blogs', (error, blogs) => {
            if (error) {
                console.log(error);
            }
            else {
                var a;
                for (a = 0; a < blogs.length; a++) {
                    blogs[a].date = functions.textdate(blogs[a].date);
                }
                return res.status(200).render('Home/Blogs', {
                    data: blogs
                });
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

exports.blog_details = async (req, res) => {
    try {
        const blogid = req.params.blog_id;
        db.query('select * from blogs where blog_id=?', [blogid], (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                db.query('select * from blogs where blog_id != ? LIMIT 5', [blogid], (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var a;
                                for (a = 0; a < results.length; a++) {
                                    results[a].date = functions.textdate(results[a].date);
                                }
                                var a;
                                for (a = 0; a < result.length; a++) {
                                    result[a].date = functions.textdate(result[a].date);
                                }
                        return res.status(200).render('Home/BlogsContent', {
                            details: results,
                            blogs: result
                        });
                    }
                })
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}


