const db = require('../database');
const mail = require('../mail');
const file = require('../files');
const functions = require('../functions');




exports.dashboard = async (req, res) => {
    try 
    {
        const centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select count(*) as count from members where centre_id=? ',[centreid],(err,membercount)=>{
                                    if(err)
                                    {
                                        console.log(err)
                                    }
                                    else
                                    {
                                        db.query('select count(*) as count from members where centre_id=? and gender= ?',[centreid,"male"],(err,malecount)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                db.query('select count(*) as count from members where centre_id=? and gender= ?',[centreid,"female"],(err,femalecount)=>{
                                                    if(err)
                                                    {
                                                        console.log(err);
                                                    }
                                                    else
                                                    {
                                                        db.query('select count(*) as count from staff where centre_id=? ',[centreid],(err,staffcount)=>{
                                                            if(err)
                                                            {
                                                                console.log(err);
                                                            }
                                                            else
                                                            {
                                                                db.query('select count(*) as count from inventory where centre_id=? GROUP BY (category);',[centreid,"female"],(err,inventorycount)=>{
                                                                    if(err)
                                                                    {
                                                                        console.log(err);
                                                                    }
                                                                    else
                                                                    {
                                                                        db.query('select count(*) as count from member_subscription where centre_id=? and date < ?',[centreid,functions.convertdate(functions.firstmonthdate(functions.date()))],(err,subscriptioncount)=>{
                                                                            if(err)
                                                                            {
                                                                                console.log(err);
                                                                            }
                                                                            else
                                                                            {
                                                                                db.query('select * from members,member_subscription where members.member_id=member_subscription.member_id and members.centre_id=member_subscription.centre_id and members.centre_id=? and ending_date <= ?',[centreid,functions.adddate(functions.date(),5)],(err,expiring)=>{
                                                                                    if(err)
                                                                                    {
                                                                                        console.log(err);
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        db.query('select * from members,member_subscription where members.member_id=member_subscription.member_id and members.centre_id=member_subscription.centre_id and members.centre_id=?and ending_date < ?',[centreid,functions.date()],(err,ended)=>{
                                                                                            if(err)
                                                                                            {
                                                                                                console.log(err);
                                                                                            }
                                                                                            else
                                                                                            {
                                                                                                return res.render('User/home',{
                                                                                                    membercount:membercount[0].count,
                                                                                                    malecount:malecount[0].count,
                                                                                                    femalecount:femalecount[0].count,
                                                                                                    staffcount:staffcount[0].count,
                                                                                                    inventorycount:inventorycount[0].count,
                                                                                                    subscriptioncount:subscriptioncount[0].count,
                                                                                                    expiring:expiring[0].count,
                                                                                                    ended:ended[0].count,
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
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill Your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.profile = async (req, res) => {
    try 
    {
        const centreid = req.fit.id;
        db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {   var a=0;
                                for(a;a<plans.length;a++)
                                {
                                    plans[a].date=functions.textdate(plans[a].date);
                                    plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                    plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                }
                                currentplan[0].date=functions.textdate(currentplan[0].date);
                                currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                return res.status(200).render('User/Profile/profile',{
                                    profile:details,
                                    currentplan:currentplan,
                                    previousplans:plans
                                });
                            }

                        })
                    }
                })
            }
        })
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_subscription = async(req,res) =>{
    try 
    {
        const centreid = req.fit.id;
        const {plan} = req.body;

        var amount;
        if(plan=='basic')
        {
            amount=2000;
        }
        else
        {
            amount=5000;
        }

        db.query('insert into fitness_centre_subscription set =?',{
            centre_id:centreid,
            date:functions.date(),
            time: functions.time(),
            starting_date:functions.date(),
            ending_date:functions.adddate(functions.date(),30),
            plan:plan,
            amount:amount},(err,result)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {
                                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                        if(err)
                                        {
                                            console.log(err);
                                        }
                                        else
                                        {var a=0;
                                            for(a;a<plans.length;a++)
                                            {
                                                plans[a].date=functions.textdate(plans[a].date);
                                                plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                            }
                                            currentplan[0].date=functions.textdate(currentplan[0].date);
                                            currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                            currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                            return res.status(200).render('User/Profile/profile',{
                                                profile:details,
                                                currentplan:currentplan,
                                                previousplans:plans
                                            });
                                        }
            
                                    })
                                }
                            })
                        }
                    })
                }
            }   
        )
    } 
    catch (error) 
    {
        console.log(error);
    }
}


exports.update_details = async(req,res) =>{
    try 
    {
        const centreid = req.fit.id;
        const {location,city,state,pincode,country} = req.body;

        if(!location || !city || !state || !pincode || !country )
        {
            db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {var a=0;
                                    for(a;a<plans.length;a++)
                                    {
                                        plans[a].date=functions.textdate(plans[a].date);
                                        plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                        plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                    }
                                    currentplan[0].date=functions.textdate(currentplan[0].date);
                                    currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                    currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                    return res.status(200).render('User/Profile/profile',{
                                        profile:details,
                                        currentplan:currentplan,
                                        previousplans:plans,
                                        info : "Fill all details"
                                    });
                                }
    
                            })
                        }
                    })
                }
            })
        }
        else
        {
            db.query('update fitness_centres set location =? ,city=? , state=?, pincode=?, country=? where centre_id=?',[location,city,state,pincode,country,centreid],(err,result)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {var a=0;
                                                for(a;a<plans.length;a++)
                                                {
                                                    plans[a].date=functions.textdate(plans[a].date);
                                                    plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                    plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                }
                                                currentplan[0].date=functions.textdate(currentplan[0].date);
                                                currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                return res.status(200).render('User/Profile/profile',{
                                                    profile:details,
                                                    currentplan:currentplan,
                                                    previousplans:plans,
                                                    success:"Details Updated"
                                                });
                                            }
                
                                        })
                                    }
                                })
                            }
                        })
                    }
                }   
            )
        }

        
    } 
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_owner_details = async(req,res) =>{
    try 
    {
        const centreid = req.fit.id;
        const {name,email,contact} = req.body;

        if(!name || !email || !contact )
        {
            db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {var a=0;
                                    for(a;a<plans.length;a++)
                                    {
                                        plans[a].date=functions.textdate(plans[a].date);
                                        plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                        plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                    }
                                    currentplan[0].date=functions.textdate(currentplan[0].date);
                                    currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                    currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                    return res.status(200).render('User/Profile/profile',{
                                        profile:details,
                                        currentplan:currentplan,
                                        previousplans:plans,
                                        info : "Fill all details"
                                    });
                                }
    
                            })
                        }
                    })
                }
            })
        }
        else
        {
            db.query('update fitness_centres set owner_name=? , owner_email=? , owner_contact=? where centre_id=?',[name,email,contact,centreid],(err,result)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {var a=0;
                                                for(a;a<plans.length;a++)
                                                {
                                                    plans[a].date=functions.textdate(plans[a].date);
                                                    plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                    plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                }
                                                currentplan[0].date=functions.textdate(currentplan[0].date);
                                                currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                return res.status(200).render('User/Profile/profile',{
                                                    profile:details,
                                                    currentplan:currentplan,
                                                    previousplans:plans,
                                                    success:"Details Updated"
                                                });
                                            }
                
                                        })
                                    }
                                })
                            }
                        })
                    }
                }   
            )
        }

        
    } 
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_centre_details = async(req,res) =>{
    try 
    {
        const centreid = req.fit.id;
        const {email,contact} = req.body;

        if(!email || !contact)
        {
            db.query('select * from fitness_centres  where centre_id=?',[centreid],(err,details)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {var a=0;
                                    for(a;a<plans.length;a++)
                                    {
                                        plans[a].date=functions.textdate(plans[a].date);
                                        plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                        plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                    }
                                    currentplan[0].date=functions.textdate(currentplan[0].date);
                                    currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                    currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                    return res.status(200).render('User/Profile/profile',{
                                        profile:details,
                                        currentplan:currentplan,
                                        previousplans:plans,
                                        info : "Fill all details"
                                    });
                                }
    
                            })
                        }
                    })
                }
            })
        }
        else
        {
            db.query('update fitness_centres set centre_email =? ,centre_contact=? where centre_id=?',[email,contact,centreid],(err,result)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {var a=0;
                                                for(a;a<plans.length;a++)
                                                {
                                                    plans[a].date=functions.textdate(plans[a].date);
                                                    plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                    plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                }
                                                currentplan[0].date=functions.textdate(currentplan[0].date);
                                                currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                return res.status(200).render('User/Profile/profile',{
                                                    profile:details,
                                                    currentplan:currentplan,
                                                    previousplans:plans,
                                                    success: "Details Updated"
                                                });
                                            }
                
                                        })
                                    }
                                })
                            }
                        })
                    }
                }   
            )
        }

        
    } 
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_username = async(req,res) =>{
    try 
    {
        const centreid = req.fit.id;
        const {username} = req.body;

        if (!username ) 
        {
            db.query('select * from fitness_centres  where centre_id=?',[centreid],(err,details)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {var a=0;
                                    for(a;a<plans.length;a++)
                                    {
                                        plans[a].date=functions.textdate(plans[a].date);
                                        plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                        plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                    }
                                    currentplan[0].date=functions.textdate(currentplan[0].date);
                                    currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                    currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                    return res.status(200).render('User/Profile/profile',{
                                        profile:details,
                                        currentplan:currentplan,
                                        previousplans:plans,
                                        info : "Fill all details"
                                    });
                                }
    
                            })
                        }
                    })
                }
            })
        }
        else
        {
            db.query("select * from fitness_centres where username = ? ",[username],async (err,results)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    if(results.length>0)
                    {
                        db.query('select * from fitness_centres  where centre_id=?',[centreid],(err,details)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {var a=0;
                                                for(a;a<plans.length;a++)
                                                {
                                                    plans[a].date=functions.textdate(plans[a].date);
                                                    plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                    plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                }
                                                currentplan[0].date=functions.textdate(currentplan[0].date);
                                                currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                return res.status(200).render('User/Profile/profile',{
                                                    profile:details,
                                                    currentplan:currentplan,
                                                    previousplans:plans,
                                                    danger : "Username Already Exists"
                                                });
                                            }
                
                                        })
                                    }
                                })
                            }
                        })
                    }
                    else
                    {
                        db.query('update fitness_centres set username=? where centre_id=? ',[username,centreid],(err,result)=>{
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,details)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                                    if(err)
                                                    {
                                                        console.log(err);
                                                    }
                                                    else
                                                    {var a=0;
                                                        for(a;a<plans.length;a++)
                                                        {
                                                            plans[a].date=functions.textdate(plans[a].date);
                                                            plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                            plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                        }
                                                        currentplan[0].date=functions.textdate(currentplan[0].date);
                                                        currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                        currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                        return res.status(200).render('User/Profile/profile',{
                                                            profile:details,
                                                            currentplan:currentplan,
                                                            previousplans:plans,
                                                            success: "Username Updated"
                                                        });
                                                    }
                        
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        }   
                    )
                    }
                }
            });
        }
    } 
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_password = async(req,res) =>{
    try 
    {
        const centreid = req.fit.id;
        const {currentpassword,newpassword,confirmnewpassword} = req.body;

        if (!currentpassword || !newpassword || !confirmnewpassword ) 
        {
            db.query('select * from fitness_centres  where centre_id=?',[centreid],(err,details)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {var a=0;
                                    for(a;a<plans.length;a++)
                                    {
                                        plans[a].date=functions.textdate(plans[a].date);
                                        plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                        plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                    }
                                    currentplan[0].date=functions.textdate(currentplan[0].date);
                                    currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                    currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                    return res.status(200).render('User/Profile/profile',{
                                        profile:details,
                                        currentplan:currentplan,
                                        previousplans:plans,
                                        info : "Fill all details"
                                    });
                                }
    
                            })
                        }
                    })
                }
            })
        }
        else
        {
            db.query("select * from fitness_centres where centre_id = ? ",[centreid],async (err,results)=>{
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    bcrypt.compare(currentpassword,results[0].password,(err,re)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            if(!re)
                            {
                                db.query('select * from fitness_centres  where centre_id=?',[centreid],(err,details)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                                    if(err)
                                                    {
                                                        console.log(err);
                                                    }
                                                    else
                                                    {var a=0;
                                                        for(a;a<plans.length;a++)
                                                        {
                                                            plans[a].date=functions.textdate(plans[a].date);
                                                            plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                            plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                        }
                                                        currentplan[0].date=functions.textdate(currentplan[0].date);
                                                        currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                        currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                        return res.status(200).render('User/Profile/profile',{
                                                            profile:details,
                                                            currentplan:currentplan,
                                                            previousplans:plans,
                                                            danger : "Wrong Current Password"
                                                        });
                                                    }
                        
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            else
                            {
                                if(newpassword!=confirmnewpassword)
                                {
                                    db.query('select * from fitness_centres  where centre_id=?',[centreid],(err,details)=>{
                                        if(err)
                                        {
                                            console.log(err);
                                        }
                                        else
                                        {
                                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                                if(err)
                                                {
                                                    console.log(err);
                                                }
                                                else
                                                {
                                                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                                        if(err)
                                                        {
                                                            console.log(err);
                                                        }
                                                        else
                                                        {var a=0;
                                                            for(a;a<plans.length;a++)
                                                            {
                                                                plans[a].date=functions.textdate(plans[a].date);
                                                                plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                                plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                            }
                                                            currentplan[0].date=functions.textdate(currentplan[0].date);
                                                            currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                            currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                            return res.status(200).render('User/Profile/profile',{
                                                                profile:details,
                                                                currentplan:currentplan,
                                                                previousplans:plans,
                                                                warning : "Password Doesn't Match"
                                                            });
                                                        }
                            
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } 
                                else
                                {
                                    var hashedpassword = bcrypt.hash(newpassword, 10);

                                    db.query('update fitness_centres set password =? where centre_id=?',[hashedpassword,centreid],(err,details)=>{
                                        if(err)
                                        {
                                            console.log(err);
                                        }
                                        else
                                        {
                                            db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,plans)=>{
                                                if(err)
                                                {
                                                    console.log(err);
                                                }
                                                else
                                                {
                                                    db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc limit 1',[centreid],(err,currentplan)=>{
                                                        if(err)
                                                        {
                                                            console.log(err);
                                                        }
                                                        else
                                                        {var a=0;
                                                            for(a;a<plans.length;a++)
                                                            {
                                                                plans[a].date=functions.textdate(plans[a].date);
                                                                plans[a].starting_date=functions.textdate(plans[a].starting_date);
                                                                plans[a].ending_date=functions.textdate(plans[a].ending_date);
                                                            }
                                                            currentplan[0].date=functions.textdate(currentplan[0].date);
                                                            currentplan[0].starting_date=functions.textdate(currentplan[0].starting_date);
                                                            currentplan[0].ending_date=functions.textdate(currentplan[0].ending_date);
                                                            return res.status(200).render('User/Profile/profile',{
                                                                profile:details,
                                                                currentplan:currentplan,
                                                                previousplans:plans,
                                                                success : "Password Updated"
                                                            });
                                                        }
                            
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } 
                                
                            }
                        }
                    });

                }
            });
        }
    } 
    catch (error) 
    {
        console.log(error);
    }
}




// Members

exports.view_add_member = async (req, res) => {
    try
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var count;
                                        if(result[0].plan=="free")
                                        {
                                            count=5;
                                        }
                                        else if(result[0].plan =="basic")
                                        {
                                            count=50;
                                        }
                                        else{
                                            count=999999999;
                                        }
                                        db.query('select count(*) as count from member where centre_id=?',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                if(result[0].count<count)
                                                {
                                                    return res.render('User/Member/Add_member');
                                                }
                                                else
                                                {
                                                    return res.status(200).render('User/error',{
                                                        text:"Upgrade your Plan for this Feature"
                                                    });
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill Your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.add_member = async (req, res) => {
    try
    {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var count;
                                        if(result[0].plan=="free")
                                        {
                                            count=5;
                                        }
                                        else if(result[0].plan =="basic")
                                        {
                                            count=50;
                                        }
                                        else{
                                            count=999999999;
                                        }
                                        db.query('select count(*) as count from staff where centre_id=?',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                if(result[0].count<count)
                                                {
                                                    file.member_image(req, res, (error) => {
                                                        if (error) {
                                                            res.render('User/Member/Add_member', {
                                                                danger: error
                                                            });
                                                        }
                                                        else
                                                        {
                                                            
                                                            const image = req.file;
                                                            const { name, dob, gender, address, contactno, emergencycontactno, email, height, weight } = req.body;
                                            
                                                            if (!name || !dob || !email || !gender || !address || !contactno || !emergencycontactno || !height || !weight || !image ) {
                                                                return res.status(400).render('User/Member/Add_member', {
                                                                    info: "Fill All the details"
                                                                });
                                                            }
                                                            else
                                                            {
                                                                db.query("Select * from member where email = ? and centre_id =?", [email,centreid], (error, results) => {
                                                                    if (error) 
                                                                    {
                                                                        console.log(error);
                                                                    }
                                                                    else 
                                                                    {
                                                                        if (results.length > 0) {
                                                                            return res.render('User/Member/Add_member', {
                                                                                warning: 'Member already Exists'
                                                                            });
                                                                        }
                                                                        else 
                                                                        {
                                                                            if (contactno.length != 10 || emergencycontactno.length != 10) {
                                                                                return res.render('User/Member/Add_member', {
                                                                                    warning: 'Provide valid Contact Numbers'
                                                                                });
                                                                            }
                                                                            else
                                                                            {
                                                                                var bmi = parseFloat(weight)/((parseFloat(height)/100)^2)
                                                                                db.query('insert into member set ?', {
                                                                                    centre_id:centreid,
                                                                                    name: name,
                                                                                    dob: dob,
                                                                                    gender: gender,
                                                                                    address: address,
                                                                                    contact: contactno,
                                                                                    emergency_contact: emergencycontactno,
                                                                                    email: email,
                                                                                    image: image.filename,
                                                                                    height : height,
                                                                                    weight : weight,
                                                                                    BMI : bmi }, 
                                                                                    (err, result) => {
                                                                                        if (err) 
                                                                                        {
                                                                                            console.log(err);
                                                                                        }
                                                                                        else 
                                                                                        {
                                                                                            return res.render('User/Member/Manage_subscription', {
                                                                                                success: 'User Registered', 
                                                                                                email:email
                                                                                            });
                                            
                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    return res.status(200).render('User/error',{
                                                        text:"Upgrade your Plan for this Feature"
                                                    });
                                                }
                                            }
                                        })
                                    }
                                })
                                
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                }); 
                            }
                        }
                    })
                }
            }
        })   
    }
    catch (error) {
        console.log(error);
    }
}

exports.view_member = async (req, res) => {
    try {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var count;
                                        if(result[0].plan=="free")
                                        {
                                            count=5;
                                        }
                                        else if(result[0].plan =="basic")
                                        {
                                            count=50;
                                        }
                                        else
                                        {
                                            count=999999999;
                                        }
                        
                                        db.query('select * from member where centre_id =? and status = ? order by(member_id) desc LIMIT ?',[centreid,"1",count], (err, result) => {
                                            if (err) 
                                            {
                                                console.log(err);
                                            }
                                            else 
                                            {
                                                var a;
                                                for (a = 0; a < result.length; a++) 
                                                {
                                                    result[a].dob = new Date(result[a].dob).toLocaleDateString();
                                                }
                                                return res.render('User/Member/View_member', { 
                                                    data: result 
                                                });
                                            }
                                        })
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                }); 
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) {
        console.log(error);
    }
}

exports.update_member1 = async (req, res) => {
    try 
    {
        const memberid = req.params.member_id;
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from member where member_id = ?',[memberid], (err, result) => {
                                    if (err) 
                                    {
                                        console.log(err);
                                    }
                                    else 
                                    {
                                        var male; var female;
                                        if (result[0].gender == "female") { male = "checked"; }
                                        else { female = "checked"; }

                                        return res.status(200).render('User/Member/Update_member', {
                                            update:"Update",
                                            props:"none",
                                            memberid:memberid,
                                            name: result[0].name,
                                            dob: functions.convertdate(result[0].dob),
                                            male:male,
                                            femlae:female,
                                            // gender: result[0].gender,
                                            address: result[0].address,
                                            contact: result[0].contact,
                                            emergencycontact: result[0].emergency_contact,
                                            email: result[0].email,
                                            height:result[0].height,
                                            weight:result[0].weight,
                                        });
                                    }
                                });
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        return res.status(200).render('User/error',{
                                            text:"Your Profile is not filled"
                                        });
                                    }
                                }) 
                            }
                        }
                    })
                }
            }
        }) 
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_member2 = async (req, res) => {
    try 
    {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                const {memberid, name, dob, gender, address, contactno, emergencycontactno, email, height, weight } = req.body;

                                var bmi = parseFloat(weight)/((parseFloat(height)/100)^2)

                                db.query('Update member set name = ? , dob = ? , gender = ? , address = ? , contact = ? , emergency_contact = ? , email = ? , weight = ? , height = ? , BMI = ? where member_id=?', [name, dob, gender, address, contactno, emergencycontactno, email, height, weight, bmi, memberid], 
                                async (err, result) => {
                                    if (err) 
                                    {
                                        console.log(err);
                                    }
                                    else 
                                    {
                                        return res.status(200).render('User/Member/Add_member', {
                                            success: 'Detils Updated',
                                            update:"Update"
                                        });
                                    }
                                });
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        return res.status(200).render('User/error',{
                                            text:"Your Profile is not filled"
                                        });
                                    }
                                }) 
                            }
                        }
                    })
                }
            }
        }) 
        
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.delete_member = async (req, res) => {
    try 
    {
        const memberid = req.params.member_id;
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('update member set status =? where member_id = ?',["0",memberid], (err, result) => {
                                    if (err) 
                                    {
                                        console.log(err);
                                    }
                                    else 
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                var count;
                                                if(result[0].plan=="free")
                                                {
                                                    count=5;
                                                }
                                                else if(result[0].plan =="basic")
                                                {
                                                    count=50;
                                                }
                                                else
                                                {
                                                    count=999999999;
                                                }
                                
                                                db.query('select * from member where centre_id =? and status = ? order by(member_id) desc LIMIT ?',[centreid,"1",count], (err, result) => {
                                                    if (err) 
                                                    {
                                                        console.log(err);
                                                    }
                                                    else 
                                                    {
                                                        var a;
                                                        for (a = 0; a < result.length; a++) 
                                                        {
                                                            result[a].dob = new Date(result[a].dob).toLocaleDateString();
                                                        }
                                                        return res.render('User/Member/View_member', { 
                                                            data: result 
                                                        });
                                                    }
                                                })
                                            }
                                        })
                                    }
                                });
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        return res.status(200).render('User/error',{
                                            text:"Your Profile is not filled"
                                        });
                                    }
                                }) 
                            }
                        }
                    })
                }
            }
        }) 
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.view_member_subscription = async (req, res) => {
    try
    {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="free")
                                        {
                                            return res.render('User/error',{
                                                text:"Upgrade your Plan for this feature"
                                            })
                                        }
                                        else 
                                        {
                                            db.query('selest * fom member_subscription as mem_sub, member where mem_sub.centre_id=? order by(mem_sub.subscription_id) desc',[centreid],(err,result)=>{
                                                if(err)
                                                {
                                                    console.log(err);
                                                }
                                                else
                                                {
                                                    return res.render('User/Member/Manage_subscription',{
                                                        data:result
                                                    }); 
                                                }
                                            })
                                              
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Details first"
                                });
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) {
        console.log(error);
    }
}

exports.member_subscription = async (req, res) => {
    try 
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                const { email, plan, startdate, days, amount } = req.body;

                                if (!email || !startdate || !plan || !amount || !days) 
                                {
                                    return res.render('fitness/member_subscription', {
                                        info: 'Fill all details'
                                    });
                                }
                                else 
                                {
                                    db.query('select member_id from member where email = ? and centre_id =?',[email,centreid],(error,result)=>{
                                        if(error)
                                        {
                                            console.log(error);
                                        }
                                        else
                                        {
                                            var memberid= result[0].member_id;

                                            if (result.length == 0)
                                            {
                                                return res.render('fitness/member_subscription', {
                                                    warning: 'Invalid Member'
                                                });
                                            }
                                            else
                                            {
                                                db.query('select * from member where member_id=?', [memberid],(error, results) => {
                                                    if (error) 
                                                    {
                                                        console.log(error);
                                                    }
                                                    else 
                                                    {
                                                        db.query("select * from member_subscription where member_id=? and centre_id= ? ", [memberid,centreid], (err, result) => {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            else 
                                                            {
                                                                if (result.length == 0) 
                                                                {
                                                                    var duration = parseInt(days);
                                
                                                                    db.query('insert into member_subscription set ?', {
                                                                        centre_id:centreid,
                                                                        member_id: memberid,
                                                                        date: functions.date(),
                                                                        time: functions.time(),
                                                                        starting_date: startdate,
                                                                        ending_date: functions.adddate(startdate, duration),
                                                                        duration: duration,
                                                                        plan: plan,
                                                                        amount: amount},(err, result) => {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            }
                                                                            else {
                                                                                db.query('Update member set status =? where member_id =?',["1",memberid],(err,result)=>{
                                                                                    if(err)
                                                                                    {
                                                                                        console.log(err);
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                                                                            if(err)
                                                                                            {
                                                                                                console.log(err);
                                                                                            }
                                                                                            else
                                                                                            {
                                                                                                if(result[0].plan=="free")
                                                                                                {
                                                                                                    return res.render('User/error',{
                                                                                                        text:"Upgrade your Plan for this feature"
                                                                                                    })
                                                                                                }
                                                                                                else 
                                                                                                {
                                                                                                    db.query('selest * fom member_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
                                                                                                        if(err)
                                                                                                        {
                                                                                                            console.log(err);
                                                                                                        }
                                                                                                        else
                                                                                                        {
                                                                                                            return res.render('User/Member/Manage_subscription',{
                                                                                                                data:result
                                                                                                            }); 
                                                                                                        }
                                                                                                    })
                                                                                                      
                                                                                                }
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                                else 
                                                                {
                                                                    db.query("select * from member_subscription where member_id=? and centre_id=? and ending_date < ?", [memberid,centreid,startdate], (err, result) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                        else 
                                                                        {
                                                                            if (result.length == 0) 
                                                                            {
                                                                                return res.render('User/Member/Manage_subscription', {
                                                                                    danger: 'Previous Subscription didnt ended'
                                                                                    
                                                                                });
                                                                            }
                                                                            else
                                                                            {
                                                                                var duration = parseInt(days);
                                            
                                                                                db.query('insert into member_subscription set ?', {
                                                                                    centre_id:centreid,
                                                                                    member_id: memberid,
                                                                                    date: functions.date(),
                                                                                    time: functions.time(),
                                                                                    starting_date: startdate,
                                                                                    ending_date: functions.adddate(startdate, duration),
                                                                                    duration: duration,
                                                                                    plan: plan,
                                                                                    amount: amount},(err, result) => {
                                                                                        if (err) {
                                                                                            console.log(err);
                                                                                        }
                                                                                        else 
                                                                                        {
                                                                                            db.query('Update member set status =? where member_id =?',["1",memberid],(err,result)=>{
                                                                                                if(err)
                                                                                                {
                                                                                                    console.log(err);
                                                                                                }
                                                                                                else
                                                                                                {
                                                                                                    db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                                                                                        if(err)
                                                                                                        {
                                                                                                            console.log(err);
                                                                                                        }
                                                                                                        else
                                                                                                        {
                                                                                                            if(result[0].plan=="free")
                                                                                                            {
                                                                                                                return res.render('User/error',{
                                                                                                                    text:"Upgrade your Plan for this feature"
                                                                                                                })
                                                                                                            }
                                                                                                            else 
                                                                                                            {
                                                                                                                db.query('selest * fom member_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
                                                                                                                    if(err)
                                                                                                                    {
                                                                                                                        console.log(err);
                                                                                                                    }
                                                                                                                    else
                                                                                                                    {
                                                                                                                        return res.render('User/Member/Manage_subscription',{
                                                                                                                            data:result
                                                                                                                        }); 
                                                                                                                    }
                                                                                                                })
                                                                                                                  
                                                                                                            }
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    })
                                }
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        return res.status(200).render('User/error',{
                                            text:"Your Profile is not filled"
                                        });
                                    }
                                }) 
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}







// Staff

exports.view_add_staff = async (req, res) => {
    try
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var count;
                                        if(result[0].plan=="free")
                                        {
                                            count=5;
                                        }
                                        else if(result[0].plan =="basic")
                                        {
                                            count=50;
                                        }
                                        else{
                                            count=999999999;
                                        }
                                        db.query('select count(*) as count from staff where centre_id=?',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                if(result[0].count<count)
                                                {
                                                    return res.render('User/Staff/Add_staff');
                                                }
                                                else
                                                {
                                                    return res.status(200).render('User/error',{
                                                        text:"Upgrade your Plan for this Feature"
                                                    });
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.add_staff = async (req, res) => {
    try
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var count;
                                        if(result[0].plan=="free")
                                        {
                                            count=5;
                                        }
                                        else if(result[0].plan =="basic")
                                        {
                                            count=50;
                                        }
                                        else{
                                            count=999999999;
                                        }
                                        db.query('select count(*) as count from staff where centre_id=?',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                if(result[0].count<count)
                                                {
                                                    file.staff_image(req, res, (error) => {
                                                        if (error) {
                                                            res.render('User/Staff/Add_staff', {
                                                                danger: error
                                                            });
                                                        }
                                                        else
                                                        {
                                                            const centreid= req.fit.id;
                                                            const image = req.file;
                                                            const { name, dob, gender, address, contactno, emergencycontactno, email, type, salary } = req.body;
                                            
                                                            if (!name || !dob || !email || !gender || !address || !contactno || !emergencycontactno || !type || !salary || !image ) {
                                                                return res.status(400).render('User/Staff/Add_staff', {
                                                                    info: "Fill All the details"
                                                                });
                                                            }
                                                            else
                                                            {
                                                                db.query("Select * from staff where email = ? and centre_id =?", [email,centreid], (error, results) => {
                                                                    if (error) 
                                                                    {
                                                                        console.log(error);
                                                                    }
                                                                    else 
                                                                    {
                                                                        if (results.length > 0) {
                                                                            return res.render('User/Staff/Add_staff', {
                                                                                warning: 'Staff already Exists'
                                                                            });
                                                                        }
                                                                        else 
                                                                        {
                                                                            if (contactno.length != 10 || emergencycontactno.length != 10) {
                                                                                return res.render('User/Staff/Add_staff', {
                                                                                    warning: 'Provide valid Contact Numbers'
                                                                                });
                                                                            }
                                                                            else
                                                                            {
                                                                                db.query('insert into member set ?', {
                                                                                    centre_id:centreid,
                                                                                    name: name,
                                                                                    dob: dob,
                                                                                    gender: gender,
                                                                                    address: address,
                                                                                    contact: contactno,
                                                                                    emergency_contact: emergencycontactno,
                                                                                    email: email,
                                                                                    type: type,
                                                                                    image: image.filename,
                                                                                    salary:salary}, 
                                                                                    (err, result) => {
                                                                                        if (err) 
                                                                                        {
                                                                                            console.log(err);
                                                                                        }
                                                                                        else 
                                                                                        {
                                                                                            return res.render('User/Staff/Add_staff', {
                                                                                                success: 'Staff Registered', 
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    return res.status(200).render('User/error',{
                                                        text:"Upgrade your Plan for this Feature"
                                                    });
                                                }
                                            }
                                        })
                                    }
                                })
                                 
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
          
    }
    catch (error) {
        console.log(error);
    }
}

exports.view_staff = async (req, res) => {
    try {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var count;
                                        if(result[0].plan=="free")
                                        {
                                            count=5;
                                        }
                                        else if(result[0].plan =="basic")
                                        {
                                            count=50;
                                        }
                                        else
                                        {
                                            count=999999999;
                                        }
                        
                                        db.query('select * from staff where centre_id =? and status = ? order by(staff_id) desc LIMIT ?',[centreid,"1",count], (err, result) => {
                                            if (err) 
                                            {
                                                console.log(err);
                                            }
                                            else 
                                            {
                                                var a;
                                                for (a = 0; a < result.length; a++) 
                                                {
                                                    result[a].dob = new Date(result[a].dob).toLocaleDateString();
                                                }
                                                return res.render('fitness/view_staff', { 
                                                    data: result 
                                                });
                                            }
                                        })
                                    }
                                });
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) {
        console.log(error);
    }
}

exports.update_staff1 = async (req, res) => {
    try 
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                const staffid = req.params.staff_id;

                                db.query('select * from staff where staff_id = ?',[staffid], (err, result) => {
                                    if (err) 
                                    {
                                        console.log(err);
                                    }
                                    else 
                                    {

                                        var male; var female;
                                        if (result[0].gender == "female") { male = "checked"; }
                                        else { female = "checked"; }

                                        return res.status(200).render('User/Staff/Update_staff', {
                                            update:"Update",
                                            props:"none",
                                            staffid:staffid,
                                            name: result[0].name,
                                            dob: functions.convertdate(result[0].dob),
                                            male: male,
                                            female: female,
                                            address: result[0].address,
                                            contact: result[0].contact,
                                            emergencycontact: result[0].emergency_contact,
                                            email: result[0].email,
                                            type:result[0].type,
                                            salary:result[0].salary,
                                        });
                                    }
                                });
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_staff2 = async (req, res) => {
    try 
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                const {staffid, name, dob, gender, address, contactno, emergencycontactno, email, type, salary} = req.body;

                                db.query('Update staff set name = ? , dob = ? , gender = ? , address = ? , contact = ? , emergency_contact = ? , email = ? , type = ? , salary = ? where staff_id=?', [name, dob, gender, address, contactno, emergencycontactno, email, type, salary, staffid], 
                                (err, result) => {
                                    if (err) 
                                    {
                                        console.log(err);
                                    }
                                    else 
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                var count;
                                                if(result[0].plan=="free")
                                                {
                                                    count=5;
                                                }
                                                else if(result[0].plan =="basic")
                                                {
                                                    count=50;
                                                }
                                                else
                                                {
                                                    count=999999999;
                                                }
                                
                                                db.query('select * from staff where centre_id =? and status = ? order by(staff_id) desc LIMIT ?',[centreid,"1",count], (err, result) => {
                                                    if (err) 
                                                    {
                                                        console.log(err);
                                                    }
                                                    else 
                                                    {
                                                        var a;
                                                        for (a = 0; a < result.length; a++) 
                                                        {
                                                            result[a].dob = new Date(result[a].dob).toLocaleDateString();
                                                        }
                                                        return res.render('User/Staff/View_staff', { 
                                                            data: result 
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        return res.status(200).render('User/error',{
                                            text:"Your Profile is not filled"
                                        });
                                    }
                                }) 
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.delete_staff = async (req, res) => {
    try 
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                const staffid = req.params.staff_id;

                                db.query('update staff set status =? where staff_id = ?',["0",staffid], (err, result) => {
                                    if (err) 
                                    {
                                        console.log(err);
                                    }
                                    else 
                                    {
                                        db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                var count;
                                                if(result[0].plan=="free")
                                                {
                                                    count=5;
                                                }
                                                else if(result[0].plan =="basic")
                                                {
                                                    count=50;
                                                }
                                                else
                                                {
                                                    count=999999999;
                                                }
                                
                                                db.query('select * from staff where centre_id =? and status = ? order by(staff_id) desc LIMIT ?',[centreid,"1",count], (err, result) => {
                                                    if (err) 
                                                    {
                                                        console.log(err);
                                                    }
                                                    else 
                                                    {
                                                        var a;
                                                        for (a = 0; a < result.length; a++) 
                                                        {
                                                            result[a].dob = new Date(result[a].dob).toLocaleDateString();
                                                        }
                                                        return res.render('User/Staff/View_staff', { 
                                                            data: result 
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                            else
                            {
                                db.query('select * from fitness_centres where centre_id=?',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        return res.status(200).render('User/error',{
                                            text:"Your Profile is not filled"
                                        });
                                    }
                                }) 
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.view_staff_salary = async (req, res) => {
    try {

        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="free")
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrade your Plan for this Feature"
                                            });
                                        }
                                        else 
                                        {
                                            db.query('select * from staff_salary as st, staff where st.centre_id =?',[centreid], (err, result) => {
                                                if (err) 
                                                {
                                                    console.log(err);
                                                }
                                                else 
                                                {
                                                    return res.render('User/Staff/View_salary', { 
                                                        data: result 
                                                    });
                                                }
                                            }) 
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.send_staff_salary = async (req, res) => {
    try 
    {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                    
                                        if(result[0].plan=="free")
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrade your Plan for this Feature"
                                            });
                                        }
                                        else
                                        {
                                            const staffid = req.params.staff_id;

                                            db.query('select * from staff where staff_id =?',[staffid],(err,results)=>{
                                                if(err)
                                                {
                                                    console.log(err);
                                                }
                                                else
                                                {
                                                    db.query('insert into staff_salary set ?',{
                                                        centre_id:centreid,
                                                        staff_id:staffid,
                                                        salary:results[0].salary,
                                                        date:functions.date(),
                                                        time:functions.time()
                                                        }, (err, result) => {
                                                        if (err) 
                                                        {
                                                            console.log(err);
                                                        }
                                                        else 
                                                        {
                                                            db.query('insert into expense set ?', {
                                                                centre_id:centreid,
                                                                title: "Salary to "+results[0].name,
                                                                type: "Salary Distribution",
                                                                date: functions.date(),
                                                                amount: results[0].salary},(err, result) => {
                                                                    if (err) 
                                                                    {
                                                                        console.log(err);
                                                                    }
                                                                    else 
                                                                    {
                                                                        db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                                                            if(err)
                                                                            {
                                                                                console.log(err);
                                                                            }
                                                                            else
                                                                            {
                                                                                var count;
                                                                                if(result[0].plan=="free")
                                                                                {
                                                                                    count=5;
                                                                                }
                                                                                else if(result[0].plan =="basic")
                                                                                {
                                                                                    count=50;
                                                                                }
                                                                                else
                                                                                {
                                                                                    count=999999999;
                                                                                }
                                                                
                                                                                db.query('select * from staff where centre_id =? and status = ? order by(staff_id) desc LIMIT ?',[centreid,"1",count], (err, result) => {
                                                                                    if (err) 
                                                                                    {
                                                                                        console.log(err);
                                                                                    }
                                                                                    else 
                                                                                    {
                                                                                        var a;
                                                                                        for (a = 0; a < result.length; a++) 
                                                                                        {
                                                                                            result[a].dob = new Date(result[a].dob).toLocaleDateString();
                                                                                        }
                                                                                        return res.render('User/Staff/View_staff', { 
                                                                                            data: result 
                                                                                        });
                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            ); 
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                });
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Your Profile is not filled"
                                });
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) {
        console.log(error);
    }
}







//Attendance

exports.mark_attendance = async (req, res) => {
    try {
        var centreid = req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        
                                        if(result[0].plan=="free")
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrade your Plan for this Feature"
                                            });
                                        }
                                        else
                                        {
                                            db.query("select * from staff where staff_id NOT IN (select staff_id from staff_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, staff2) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    db.query('select * from staff_attendance,staff where staff.staff_id=staff_attendance.staff_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, staff1) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        else 
                                                        {
                                                            db.query("select * from member where member_id NOT IN (select member_id from member_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, member2) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                                else {
                                                                    db.query('select * from attendance,member where member.member_id=attendance.member_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, member1) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                        else {
                                                                            res.render('User/Attendance/Mark_attendance', {
                                                                                staff1: staff1,
                                                                                staff2: staff2,
                                                                                member1: member1,
                                                                                member2: member2
                                                                            });
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })

        
    }
    catch (error) {
        console.log(error);
    }
}

exports.view_attendance = async (req, res) => {
    try {
        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from staff_attendance,staff where staff.staff_id=staff_attendance.staff_id', (err, staff) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        if(result[0].plan=="free")
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrade your Plan for this Feature"
                                            });
                                        }
                                        else
                                        {
                                            db.query('select * from member_attendance,member where member.member_id=member_attendance.member_id', (err, member) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    for (a = 0; a < result.length; a++) {
                                                        result[a].date = new Date(result[a].date).toLocaleDateString();
                                                    }
                                                    res.render('User/Attendance/View_attendance', {
                                                        staff: staff,
                                                        member: member
                                                    });
                                                }
                                            })
                                        }
                                        
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error)
    }
}

exports.in_time_member = async (req, res) => {
    try {
        const memberid = req.params.member_id;
        const centreid = req.fit.id;

        db.query('insert into member_attendance set ?',
            {
                member_id: memberid,
                centre_id:centreid,
                date: functions.date(),
                in_time: functions.time()
            }, (err, result) => {
                if (err) 
                {
                    console.log(err);
                }
                else
                {
                    db.query("select * from staff where staff_id NOT IN (select staff_id from staff_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, staff2) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            db.query('select * from staff_attendance,staff where staff.staff_id=staff_attendance.staff_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, staff1) => {
                                if (err) {
                                    console.log(err);
                                }
                                else 
                                {
                                    db.query("select * from member where member_id NOT IN (select member_id from member_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, member2) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            db.query('select * from attendance,member where member.member_id=attendance.member_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, member1) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    res.render('User/Attendance/Mark_attendance', {
                                                        staff1: staff1,
                                                        staff2: staff2,
                                                        member1: member1,
                                                        member2: member2
                                                    });
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
    catch (error) {
        console.log(error);
    }
}

exports.out_time_member = async (req, res) => {
    try 
    {
        const memberid = req.params.member_id;
        const centreid = req.fit.id;

        db.query('Update member_attendance set out_time=? where member_id =? and date= ? and out_time=? and centre_id=?', [functions.time(), memberid, functions.date(), "00:00:00",centreid], (err, result) => {
            if (err) {
                console.log(err);
            }
            else 
            {
                db.query("select * from staff where staff_id NOT IN (select staff_id from staff_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, staff2) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        db.query('select * from staff_attendance,staff where staff.staff_id=staff_attendance.staff_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, staff1) => {
                            if (err) {
                                console.log(err);
                            }
                            else 
                            {
                                db.query("select * from member where member_id NOT IN (select member_id from member_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, member2) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        db.query('select * from attendance,member where member.member_id=attendance.member_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, member1) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                res.render('User/Attendance/Mark_attendance', {
                                                    staff1: staff1,
                                                    staff2: staff2,
                                                    member1: member1,
                                                    member2: member2
                                                });
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
    catch (error) {
        console.log(error);
    }
}

exports.in_time_staff = async (req, res) => {
    try {
        const staffid = req.params.staff_id;
        const centreid = req.fit.id;

        db.query('insert into staff_attendance set ?',
            {
                staff_id: staffid,
                centre_id:centreid,
                date: functions.date(),
                in_time: functions.time()
            }, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else
                {
                    db.query("select * from staff where staff_id NOT IN (select staff_id from staff_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, staff2) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            db.query('select * from staff_attendance,staff where staff.staff_id=staff_attendance.staff_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, staff1) => {
                                if (err) {
                                    console.log(err);
                                }
                                else 
                                {
                                    db.query("select * from member where member_id NOT IN (select member_id from member_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, member2) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            db.query('select * from attendance,member where member.member_id=attendance.member_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, member1) => {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    res.render('User/Attendance/Mark_attendance', {
                                                        staff1: staff1,
                                                        staff2: staff2,
                                                        member1: member1,
                                                        member2: member2
                                                    });
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
    catch (error) {
        console.log(error);
    }
}

exports.out_time_staff = async (req, res) => {
    try {
        const staffid = req.params.staff_id;
        const centreid = req.fit.id;

        db.query('Update staff_attendance set out_time=? where staff_id =? and date= ? and out_time=? and centre_id =?', [functions.time(), staffid, functions.date(), "00:00:00",centreid], (err, result) => {
            if (err) {
                console.log(err);
            }
            else 
            {
                db.query("select * from staff where staff_id NOT IN (select staff_id from staff_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, staff2) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        db.query('select * from staff_attendance,staff where staff.staff_id=staff_attendance.staff_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, staff1) => {
                            if (err) {
                                console.log(err);
                            }
                            else 
                            {
                                db.query("select * from member where member_id NOT IN (select member_id from member_attendance where date = ? and out_time= ? ) ", [functions.date(), "00:00:00"], (err, member2) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        db.query('select * from attendance,member where member.member_id=attendance.member_id and date=? and out_time=?', [functions.date(), "00:00:00"], (err, member1) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                res.render('User/Attendance/Mark_attendance', {
                                                    staff1: staff1,
                                                    staff2: staff2,
                                                    member1: member1,
                                                    member2: member2
                                                });
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
    catch (error) {
        console.log(error);
    }
}







//Expense
exports.view_add_expense = async (req, res) => {
    try
    {
        
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="premium")
                                        {
                                            return res.render('User/Expense/Add_expense')
                                        }
                                        else 
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrde Your Plan for this Feature"
                                            });  
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill Your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }      
    catch (error) 
    {
        console.log(error);
    }
}

exports.add_expense = async (req, res) => {
    try
    {
        
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        info:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="premium")
                                        {
                                            file.expense(req, res, (error) => {
                                                if (error) {
                                                    res.render('User/Expense/Add_expense', {
                                                        danger: error
                                                    });
                                                }
                                                else
                                                {
                                                    const expense = req.file;
                                                    const { title, type, amount } = req.body;
                                    
                                                    if (!title || !type || !amount|| !image ) {
                                                        return res.status(400).render('User/Expense/Add_expense', {
                                                            info: "Fill All the details"
                                                        });
                                                    }
                                                    else
                                                    {
                                                        
                                                        db.query('insert into expense set ?', {
                                                            centre_id:centreid,
                                                            title: title,
                                                            type: type,
                                                            date: functions.date(),
                                                            file: expense.filename,
                                                            amount: amount},(err, result) => {
                                                                if (err) 
                                                                {
                                                                    console.log(err);
                                                                }
                                                                else 
                                                                {
                                                                    return res.render('User/Expense/Add_expense', {
                                                                        success: 'Expenses Added', 
                                                                    });
                                                                    
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                        else 
                                        {
                                            return res.status(200).render('User/error',{
                                                info:"Upgrade your plan for this Feature"
                                            });    
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    info:"Fill your Details first"
                                }); 
                            }
                        }
                    })
                }
            }
        })
    }      
    catch (error) 
    {
        console.log(error);
    }
}

exports.view_expense = async (req, res) => { 
    try 
    {

        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="premium")
                                        {
                                            db.query('select * from expense where centre_id =? ',[centreid], (err, result) => {
                                                if (err) 
                                                {
                                                    console.log(err);
                                                }
                                                else 
                                                {
                                                    var a;
                                                    for (a = 0; a < result.length; a++) 
                                                    {
                                                        result[a].date= new Date(result[a].dob).toLocaleDateString();
                                                    }
                                                    return res.render('User/Expense/View_expense', { 
                                                        data: result 
                                                    });
                                                }
                                            })
                                        }
                                        else 
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrde Your Plan for this Feature"
                                            }); 
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}







//Inventory
exports.view_add_inventory = async (req, res) => {
    try
    {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="premium")
                                        {
                                            return res.render('User/Inventory/Add_product') 
                                        }
                                        else 
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrade Your plan For this feature"
                                            }); 
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill Your Profile first"
                                }); 
                            }
                        }
                    })
                }
            }
        })
          
    }
    catch (error) {
        console.log(error);
    }
}

exports.add_inventory = async (req, res) => {
    try
    {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="premium")
                                        {
                                            file.inventory(req, res, (error) => {
                                                if (error) 
                                                {
                                                    res.render('User/Inventory/Add_product', {
                                                        danger: error
                                                    });
                                                }
                                                else
                                                {
                                                    
                                                    const inventory = req.file;
                                                    const { name, category, quantity, purchase_date, warrenty, warrenty_days, amount } = req.body;
                                    
                                                    if (!name ||category || !quantity || !purchase_date || !amount) {
                                                        return res.status(400).render('User/Inventory/Add_product', {
                                                            info: "Fill All the details"
                                                        });
                                                    }
                                                    else
                                                    {
                                                        if(!warrenty_days)
                                                        {
                                                            warrenty = 0
                                                        }
                                                        else{
                                                            warrenty = 1
                                                        }

                                                        db.query('insert into inventory set ?', {
                                                            centre_id:centreid,
                                                            name: name,
                                                            category: category,
                                                            quantity: quantity,
                                                            purchase_date: purchase_date,
                                                            warrenty: warrenty,
                                                            warrenty_days: warrenty_days,
                                                            warrenty_expiry_date: functions.adddate(purchase_date,warrenty_days),
                                                            file: inventory.filename,
                                                            amount: amount,
                                                            total : (amount*quantity)},(err, result) => {
                                                                if (err) 
                                                                {
                                                                    console.log(err);
                                                                }
                                                                else 
                                                                {
                                                                    return res.render('User/Inventory/Add_product', {
                                                                        success: 'Inventory Added', 
                                                                    });
                                                                    
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            }); 
                                        }
                                        else 
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Uprade your Plan for this feature"
                                            });    
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill your Profile first"
                                }); 
                            }
                        }
                    })
                }
            }
        })
          
    }
    catch (error) {
        console.log(error);
    }
}

exports.view_inventory = async (req, res) => {
    try {
        const centreid= req.fit.id;

        db.query('select * from fitness_centre_subscription where centre_id=? order by(subscription_id) desc',[centreid],(err,result)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(functions.convertdate(result[0].ending_date)<=functions.date())
                {
                    return res.status(200).render('User/error',{
                        text:"Your Subscription is over"
                    });
                }
                else
                {
                    db.query('select * from fitness_centres where centre_id IN (select centre_id from fitness_centres where location IS NULL OR city IS NULL OR state IS NULL OR pincode IS NULL OR country IS NULL OR owner_name IS NULL OR owner_email IS NULL OR owner_contact IS NULL OR centre_contact IS NULL) AND centre_id =?',[centreid],(err,result)=>{
                        if(err)
                        {
                            console.log(err)
                        }
                        else
                        {
                            if(result.length==0)
                            {
                                db.query('select * from fitness_centre_subscription where centre_id= ? order by(subscription_id) desc LIMIT 1',[centreid],(err,result)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(result[0].plan=="premium")
                                        {
                                            db.query('select * from inventory where centre_id =? and status = ?',[centreid,"1"], (err, result) => {
                                                if (err) 
                                                {
                                                    console.log(err);
                                                }
                                                else 
                                                {
                                                    var a;
                                                    for (a = 0; a < result.length; a++) 
                                                    {
                                                        result[a].purchase_date = new Date(result[a].purchase_date).toLocaleDateString();
                                                        if(functions.convertdate(result[a].purchase_date)>functions.date())
                                                        {
                                                            result[a].valid = "Yes"
                                                        }
                                                        else
                                                        {
                                                            result[a].valid = "No"
                                                        }
                                                    }
                                                    return res.render('User/Inventory/View_product', { 
                                                        data: result 
                                                    });
                                                }
                                            }) 
                                        }
                                        else 
                                        {
                                            return res.status(200).render('User/error',{
                                                text:"Upgrade Your plan For this feature"
                                            }); 
                                        }
                                    }
                                })
                            }
                            else
                            {
                                return res.status(200).render('User/error',{
                                    text:"Fill Your Profile first"
                                });
                            }
                        }
                    })
                }
            }
        })
        
    }
    catch (error) {
        console.log(error);
    }
}

exports.update_inventory1 = async (req, res) => {
    try 
    {
        const inventoryid = req.params.inventory_id;

        db.query('select * from inventory where inventory_id = ?',[inventoryid], (err, result) => {
            if (err) 
            {
                console.log(err);
            }
            else 
            {
                return res.status(200).render('User/Inventory/Update_product', {
                    update:"Update",
                    props:"none",
                    inventoryid:inventoryid,
                    name: result[0].name,
                    category: result[0].category,
                    quantity: result[0].quantity,
                    purchase_date: result[0].purchase_date,
                    warrenty: result[0].warrenty,
                    warrenty_days: result[0].warrenty_days,
                    amount: result[0].amount
                });
            }
        });
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.update_inventory2 = async (req, res) => {
    try 
    {
        const {inventoryid, name, category, quantity, purchase_date, amount} = req.body;

       
        var total = amount*quantity;

        db.query('Update inventory set name = ? , category = ? , quantity = ? , purchase_date = ? , amount = ? , total = ? where inventory_id=?', [name, category, quantity, purchase_date, amount, total, inventoryid], 
        (err, result) => {
            if (err) 
            {
                console.log(err);
            }
            else 
            {
                return res.status(200).render('User/Inventory/Add_product', {
                    success: 'Detils Updated',
                    update:"Update"
                });
            }
        });
    }
    catch (error) 
    {
        console.log(error);
    }
}

exports.delete_inventory = async (req, res) => {
    try 
    {
        const inventoryid = req.params.inventory_id;
        const centreid= req.fit.id;

        db.query('update inventory set status =? where inventory_id = ?',["0",inventoryid], (err, result) => {
            if (err) 
            {
                console.log(err);
            }
            else 
            {
                db.query('select * from inventory where centre_id =? and status = ?',[centreid,"1"], (err, result) => {
                    if (err) 
                    {
                        console.log(err);
                    }
                    else 
                    {
                        var a;
                        for (a = 0; a < result.length; a++) 
                        {
                            result[a].purchase_date = new Date(result[a].purchase_date).toLocaleDateString();
                            if(functions.convertdate(result[a].purchase_date)>functions.date())
                            {
                                result[a].valid = "Yes"
                            }
                            else
                            {
                                result[a].valid = "No"
                            }
                        }
                        return res.render('User/Inventory/View_product', { 
                            data: result 
                        });
                    }
                })
            }
        });
    }
    catch (error) 
    {
        console.log(error);
    }
}

