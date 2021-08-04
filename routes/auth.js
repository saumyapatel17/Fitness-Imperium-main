const express = require("express");

const admin = require("../src/controllers/admin");
const home = require("../src/controllers/home");

const tokens = require("../src/verifyToken");

const router = express.Router();

//Routes for Home pages
router.post('/login',home.login);
router.post('/register',home.register);
router.post('/email_verification',home.forget_password);
router.post('/authentication',tokens.otpToken,home.authentication);
router.post('/change_password',tokens.otpToken,home.change_password);





//Routes for admin's pages

//Update Plan Route
router.post('/User/Update_plan',tokens.fitToken,admin.update_subscription);
router.post('/User/Update_details',tokens.fitToken,admin.update_details);
router.post('/User/Update_owner_details',tokens.fitToken,admin.update_owner_details);
router.post('/User/Update_centre_details',tokens.fitToken,admin.update_centre_details);
router.post('/User/Update_username',tokens.fitToken,admin.update_username);
router.post('/User/Update_password',tokens.fitToken,admin.update_password);

//Member's Routes
router.post('User/Member/Add_member',tokens.fitToken,admin.add_member);
router.post('User/Member/Update_member',tokens.fitToken,admin.update_member2);
router.post('User/Member/Delete_member/:member_id',tokens.fitToken,admin.delete_member);
router.post('User/Member/Member_subscription',tokens.fitToken,admin.member_subscription);

//Staff's Routes
router.post('User/Staff/Add_staff',tokens.fitToken,admin.add_staff);
router.post('User/Staff/Update_staff',tokens.fitToken,admin.update_staff2);
router.post('User/Staff/Delete_staff/:staff_id',tokens.fitToken,admin.delete_staff);
router.post('User/Staff/Send_salary/:staff_id',tokens.fitToken,admin.send_staff_salary);

//Inventory's Routes
router.post('User/Inventory/Add_inventory',tokens.fitToken,admin.add_inventory);
router.post('User/Inventory/Update_inventory',tokens.fitToken,admin.update_inventory2);
router.post('User/Inventory/Delete_inventory/:inventory_id',tokens.fitToken,admin.delete_inventory);

//Expense's Routes
router.post('User/Expense/Add_expense',tokens.fitToken,admin.add_expense);

//Attendance's Routes
router.get('User/Attendance/Staff/in_time/:staff_id',tokens.fitToken,admin.in_time_staff);
router.get('User/Attendance/Staff/out_time/:staff_id',admin.out_time_staff);
router.get('User/Attendance/Member/in_time/:member_id',tokens.fitToken,admin.in_time_member);
router.get('User/Attendance/Member/out_time/:member_id',admin.out_time_member);


module.exports = router;