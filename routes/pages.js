const express = require("express");

const router = express.Router();

const tokens = require("../src/verifyToken");

const admin = require("../src/controllers/admin");
const home = require("../src/controllers/home");


//Home Routes

router.get('/',home.home);
router.get('/centre',home.centres);
router.get('/portfolio/:centre_id',home.portfolio);
router.get('/blogs',home.blogs);
router.get('/blogsdetails/:blog_id',home.blog_details);
router.get('/login',(req,res) =>{
    res.render('LoginRegister/Login');
});
router.get('/register',(req,res) =>{
    res.render('LoginRegister/Register');
});
router.get('/login/forgetpassword',(req,res) =>{
    res.render('LoginRegister/EmailVerification');
});
router.get('/login/forgetpassword/authencation',tokens.otpToken,(req,res) =>{
    res.render('LoginRegister/OTPVerification');
});
router.get('/login/forgetpassword/changepassword',tokens.otpToken,(req,res) =>{
    res.render('LoginRegister/ChangePassword');
});
router.get('/logout',home.logout);



//Admin's Routes

router.get('/User/home',tokens.fitToken,admin.dashboard);
router.get('/User/profile',tokens.fitToken,admin.profile);
// router.get('/User/Profile/profile',tokens.fitToken,admin.profile);
// router.get('/User/error',tokens.fitToken,admin.error);


router.get('/User/Member/Add_member',tokens.fitToken,admin.view_add_member);
router.get('/User/Member/View_member',tokens.fitToken,admin.view_member);
router.get('/User/Member/Update_member/:member_id',tokens.fitToken,admin.update_member1);
router.get('/User/Member/Manage_subscription',tokens.fitToken,admin.view_member_subscription);
// router.get('/User/Member/View_subscription',tokens.fitToken,admin.view_member_subscription);

//staff's Routes
router.get('/User/Staff/Add_staff',tokens.fitToken,admin.view_add_staff);
router.get('/User/Staff/View_staff',tokens.fitToken,admin.view_staff);
router.get('/User/Staff/Update_staff/:staff_id',tokens.fitToken,admin.update_staff1);
router.get('/User/Staff/View_salary',tokens.fitToken,admin.view_staff_salary);


//Attendance's Routes
router.get('/User/Attendance/Mark_attendance',tokens.fitToken,admin.mark_attendance);
router.get('/User/Attendance/View_attendance',tokens.fitToken,admin.view_attendance);


//Expense's Routes
router.get('/User/Expense/Add_expense',tokens.fitToken,admin.view_add_expense);
router.get('/User/Expense/View_expense',tokens.fitToken,admin.view_expense);


//Inventory's Routes
router.get('/User/Inventory/Add_product',tokens.fitToken,admin.view_add_inventory);
// router.get('/User/Inventory/Update_product/:inventory_id',tokens.fitToken,admin.view_update_inventory);
router.get('/User/Inventory/View_product',tokens.fitToken,admin.view_inventory);


module.exports = router;
