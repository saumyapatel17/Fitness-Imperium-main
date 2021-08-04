const multer = require('multer');
const path = require('path');

const memberImage = multer.diskStorage({
    destination: './uploads/Members/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

exports.member_image = multer({ storage : memberImage }).single('member_image');



const staffImage = multer.diskStorage({
  destination: './uploads/Staff/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

exports.staff_image = multer({ storage : staffImage }).single('staff_image');



const inventory = multer.diskStorage({
  destination: './uploads/Inventory/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

exports.inventory = multer({ storage : inventory }).single('inventory');



const expenses = multer.diskStorage({
  destination: './uploads/Expenses/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

exports.expense = multer({ storage : expenses }).single('expense');

