const convertdate = function convertdate(x){
    var date=new Date(x).toLocaleDateString();
    var newdate = date.split("/")
    if(newdate[1]<10) 
    {
        newdate[1]='0'+newdate[1];
    } 
    if(newdate[0]<10) 
    {
        newdate[0]='0'+newdate[0];
    } 
    var dat = newdate[2]+"-"+newdate[1]+"-"+newdate[0]
    return dat
}

const firstmonthdate =function startOfMonth(date){
    return new Date(date.getFullYear(), date.getMonth(), 1);
}


const date = function date(){
    var today = new Date();
    var date;
    var month;
    
    if(today.getMonth()+1<10) 
    {
        month='0'+(today.getMonth()+1)
    } 
    else
    {
        month=(today.getMonth()+1)
    }

    if(today.getDate()<10) 
    {
        date="0"+today.getDate()
    } 
    else
    {
        date=today.getDate()
    }
    var finaldate = today.getFullYear()+'-'+month+'-'+date;
    return finaldate;
}

const time = function time(){
    var today = new Date();
    var date = today.getHours() +':'+(today.getMinutes())+':'+today.getSeconds();
    return date;
}

const adddate = function adddate(date,day){
    var d = new Date(date);
    d.setDate(d.getDate() + day);
    var date
    var month;
    if(d.getMonth()+1<10) 
    {
        month='0'+(d.getMonth()+1)
    }
    else
    {
        month=(d.getMonth()+1)
    } 
    
    if(d.getDate()<10) 
    {
        date="0"+d.getDate()
    } 
    else
    {
        date=d.getDate()
    }
    var finaldate = d.getFullYear()+'-'+month+'-'+date;
    return finaldate;

}

const difdate = function difdate(date1,date2){
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    var diff = (d1-d2) / (1000 * 3600 * 24);
    return diff;
}

const genPass = function genPass() {
    var pass = '';
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';
      
    for (i = 1; i <= 8; i++) {
        var char = Math.floor(Math.random()
                    * str.length + 1);
          
        pass += str.charAt(char)
    }
      
    return pass;
}

const otpcode = function otpcode() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

const textdate = function textdate(x){
    var date=new Date(x).toLocaleDateString();
    var newdate = date.split("/")
    var mnth=parseInt(newdate[1]);
    if(newdate[1]<10) 
    {
        newdate[1]='0'+newdate[1];
    } 
    if(newdate[0]<10) 
    {
        newdate[0]='0'+newdate[0];
    } 
    var dat = newdate[2]+"-"+newdate[1]+"-"+newdate[0]

    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];
    var year="";
    if(newdate[2]<new Date().getFullYear())
    {
        year=newdate[2];
    }
    var dateText = newdate[0]+" "+monthNames[mnth-1]+" "+year
    return dateText
}


exports.textdate=textdate;
exports.date = date;
exports.time = time;
exports.adddate = adddate;
exports.difdate=difdate;
exports.genPass = genPass;
exports.otpcode = otpcode;
exports.convertdate=convertdate;
exports.firstmonthdate=firstmonthdate;