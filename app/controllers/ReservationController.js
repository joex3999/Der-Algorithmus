let NonRepeatableActivity = require('../models/NonRepeatableActivity');
let RepeatableActivity = require("../models/RepeatableActivity");
let NonRepeatableActivityReservation = require("../models/NonRepeatableActivityReservation");
let RepeatableActivityReservation = require("../models/RepeatableActivityReservation");
let stripe = require("stripe")("sk_test_Hr41ZUg64PJe2duUepC7ruyr");
let ReservationController={
		//A Function that checks the type of the activity in hand and call the appropriate function accordingly.
    reserveSlot:function(req,res){

      if(req.params.type==0)
      return ReservationController.repeatableReserveSlot(req,res);
      else{
       return   ReservationController.nonRepeatableReserveSlot(req,res);
      }
    },

		//This function is for the repeatable activity reservation . it takes the client id from the request paramters , the slot_id , the package id
		// ,and the price . it checks if the reservation is in the past and rejects it if it is . it then checks if there is already a reservation
		// in this particular time given . if there is an appropriate error is sent back if it is not we reserve this slot after checking if it is not
		// a day off for the activity
    repeatableReserveSlot:function(req,res){

      var client_id = req.user._id;
      var slot_id = req.body.slot_id;
      var package_id = req.body.package_id;
      var date = req.body.date;
      var repeatableActivity_id = req.params.activity_id;
      var price ;
      var newDate = new Date(date);

      newDate.setDate(newDate.getDate()+1);

      var missingFields = client_id==null ||client_id=='' ||
       slot_id==null || slot_id==''||
      repeatableActivity_id==null || repeatableActivity_id==''||date==null || date =='';

      if(missingFields){
        res.json({success:false,status:-1,message:"Please insert all missing fields"});
      }else{
        var today = new Date();
          if(date<today){
            res.json({success:false,message:"You can only reserve a date which is greater than or equal to today"});
          return ;
        }


         RepeatableActivityReservation.findOne({slot_id:slot_id,repeatableActivity_id:repeatableActivity_id,date:newDate},function(err,activity){
          if(err)
          res.json({success:false,status:0,message:err});
          else
          {

            if(activity){
              res.json({success:false,status:2,message:"Sorry , This slot is already reserved ."});
            }else{
              RepeatableActivity.findOne({_id:repeatableActivity_id},function(err,activity){
                if(activity)
                {
                // date.setDate(date.getDate()+1);
                  var packagee  = activity.pricePackages.id(package_id);
                  var price = packagee.price;
                  var participants = packagee.participants;
                  var reservation = new RepeatableActivityReservation();
                  reservation.repeatableActivity_id = repeatableActivity_id;
                  reservation.client_id=client_id;
                  reservation.slot_id=slot_id;
                  reservation.participants=participants;
                  reservation.date=newDate;
                  reservation.price=price;
                  return ReservationController.FreeDayCheck(req,res,activity,date,reservation);

                }
              });

            }
          }


        });

      }



    },

		//This function is for reserving in a nonRepeatable activity . it takes the repeatable activity id , the client id from the
		// Request paramters , and the price . it then checks if the number of participants is less than 1 . return an appropriate error message
		// in this case . checks for missing fields, See if there is enough places in this activity and if there is we complete the reservation
		// if there is not we send an appropriate error message
    nonRepeatableReserveSlot:function(req,res){

      var nonRepeatableActivity_id = req.params.activity_id;
      var client_id = req.user._id ;
      var participants = req.body.participants;
      var price = req.body.price;
      if(Number(participants)<1){

              res.json({success:false,status:-1,message:"Number of participants can't be less than 1 "});
              return ;
      }
      var missingFields = client_id==null ||client_id=='' ||nonRepeatableActivity_id==null || nonRepeatableActivity_id==''|| participants==null || participants=='' || price ==null || price =='';
      if(missingFields)
      res.json({success:false,status:-1,message:"Please Enter all fields "});
      else{

          NonRepeatableActivity.findOne({_id:nonRepeatableActivity_id},function(err,activity){
            if(err)
            res.json({success:false,status:0,message:err});
            else {
              if(activity){
                if(Number(participants)+Number(activity.currentParticipants)>Number(activity.maxParticipants)){
                  res.json({success:false,status:1,message:"Sorry , there are no enough places for you in this activity."});
                }else{

                    var reservation = new NonRepeatableActivityReservation();
                    reservation.nonRepeatableActivity_id = nonRepeatableActivity_id;
                    reservation.client_id = client_id;
                    reservation.participants= participants;
                    reservation.price = price ;
                      res.json({success:true,status:1,message:"You Reserved Succesfuly",reservation:reservation});

                }

              }else{
                  res.json({succes:false,status:-1,message:"Activity is not present !"});
              }
            }

            });

      }
    },
			// this function is used to give back a certain activity , it takes the activity id as a parameter and the type to check
			// if it repetable of non repeatable .
    getActivity:function(req,res){

      var activity_id = req.params.activity_id;
      var activity_type = req.params.activity_type;

        if(activity_type==0){

          RepeatableActivity.findOne({_id:activity_id},function(err,activity){

            if(err)
            res.json({success:false,message:err});
            else {
              if(activity){

              res.json({success:true,activity:activity});
              return ;
                    }
              else {
                res.json({success:false,message:"Activity not found "});
                return ;
              }
            }
          });
      }else{
        NonRepeatableActivity.findOne({_id:activity_id},function(err,activity){
            if(err)
            res.json({success:false,message:err});
            else {
              if(activity)
              res.json({success:true,activity});
              else {
                res.json({success:false,message:"Activity not found "});
              }
            }
        });
      }
    },
		// This function is used to check if the slot you are trying to reserve is a day off for this activity. an appropriate error message
    FreeDayCheck:function(req,res,activity,date,reservation){
  var dat = new Date(date);

var found = false ;
  for(var i =0 ; i<7;i++){
    if(activity.dayOffs[i]==dat.getDay()){
      found= true ;
    }
  }

  if(!found){
    res.json({success:true,status:1,message:"You reserved successfuly",reservation:reservation});
    }else{
          res.json({success:false,status:0,message:"Sorry this day is a day Off. Please choose another"});
      }
    },
		//this function is used for the actual reservation of an activity ( actually saving the data in the database ) it is executed after
		// stripe AI call . it takes charges the client and save the reservation . ( including the charge key for refunding later )
    Pay:function(req,resp){

      if(req.body.type==0){
        var token = req.body.stripeToken;
				 var chargeAmount = req.body.chargeAmount;
				var charge = stripe.charges.create ({
					amount:chargeAmount,
					currency:"gbp",
					source: token
				},function(err,charge){
					if(err)
            resp.send(err);
          else{
            var res = new   RepeatableActivityReservation();
            res.repeatableActivity_id = req.body.repeatableActivity_id;
            res.client_id = req.body.client_id;
            res.slot_id = req.body.slot_id;
            res.date=req.body.date;
            res.participants= req.body.participants;
            res.price=req.body.price;

            res.charge_key=charge.id;
            res.save(function(err){
              if(err){

              }else{

              resp.redirect("/");

              }
            });
}});      }else{

				var token = req.body.stripeToken;
				var chargeAmount = req.body.chargeAmount;
				var charge = stripe.charges.create ({
					amount:chargeAmount,
					currency:"gbp",
					source: token
				},function(err,charge){
					if(err)
          res.send(err);
              else{
                var   res = new NonRepeatableActivityReservation();
                res.nonRepeatableActivity_id = req.body.nonRepeatableActivity_id;
                res.client_id = req.body.client_id;
                res.participants=req.body.participants;
                res.price = req.body.price;
                  res.charge_key=charge.id;
                  res.save(function(err){
                    if(err)
                    resp.json({success:false,status:0,message:err});
                    else {
                      NonRepeatableActivity.update({_id:req.body.nonRepeatableActivity_id},{$inc:{currentParticipants:req.body.participants}},function(err){
                        if(err)
                        resp.json({success:false,status:0,message:err});
                        else{

                            resp.redirect('/');

                        }
                      } );
                    }
                  });

              }

				});

      }
    },



      //Function for getting all reservations of a certain client . it takes the client_id from the request parameters and returns
			// all his relevant activities . both repeatable and non repeatable
      getAllReservations:function(req,res){


        var client_id = req.user._id;
        NonRepeatableActivityReservation.find({client_id:client_id}).populate( {path: 'nonRepeatableActivity_id', populate: {path: 'businessOwner_id'} }).exec(function(err,reservations1){
              if(err){
              res.json({succes:false,message:err});
              }else{
               RepeatableActivityReservation.find({client_id:client_id}).populate( {path: 'repeatableActivity_id', populate: {path: 'businessOwner_id'} }).exec(function(err,reservations2){
                 if(err){
                   res.json({succes:false,message:err});
                 }else {
                     res.json({success:true ,nonRepeatable:reservations1,repeatable:reservations2});
                 }
               })
          }
        });
      },
       //Function for canceling reservation . it takes the reservation ID as a parameter and the type . looks for this current reservation
			// whether it is repeatable or non repeatable and cancel it ( refunding and deleting it from the database ) if it is
			// not past the cancellation window .
       cancelReservation:function(req,res){

         var reservation_id = req.params.reservation_id;
         var type = req.params.type;
         if(type==0){
            RepeatableActivityReservation.findOne({_id:reservation_id},function(err,reservation){
              if(err)
                res.json({succes:false,message:err});
                else{

                  RepeatableActivity.findOne({_id:reservation.repeatableActivity_id},function(err,activity){
                    if(err)
                       res.json({succes:false,message:err});
                       else{
                          var window = activity.cancellationWindow;
                          var now = new Date();
                          var date = reservation.date;
                          var diff = (((Math.abs(date-now)/1000)/60)/60)/24;
                          if(diff<=window){
                             res.json({succes:false,message:"Sorry,The deadline for cancelling this reservation has passed!"});
                           }else{

                             stripe.refunds.create( {
                                       charge : reservation.charge_key
                                     },function(err,refund){

                                       if(err)
                                       res.json({succes:false,message:err});
                                       else{

                                         RepeatableActivityReservation.remove({_id:reservation._id},function(err){
                                           if(err)
                                                res.json({succes:false,message:err});
                                           else{

                                                res.json({success:true ,message:"Reservation Deleted Successfuly"});
                                           }
                                         });
                                       }
                                     });

                           }
                       }
                  });
                }
            });



         }else{
                    NonRepeatableActivityReservation.findOne({_id:reservation_id},function(err,reservation){
                      if(err)
                      res.json({succes:false,message:err});
                      else{
                        NonRepeatableActivity.findOne({_id:reservation.nonRepeatableActivity_id},function(err,activity){
                          if(err)
                            res.json({succes:false,message:err});
                            else{

                              var window = activity.cancellationWindow;
                              var now = new Date();
                              var date = activity.travelingDate;
                                var diff = (((Math.abs(date-now)/1000)/60)/60)/24;

                                if(diff<=window){
                                   res.json({succes:false,message:"Sorry,The deadline for cancelling this reservation has passed!"});
                                 }else{

                                   stripe.refunds.create( {
                                             charge : reservation.charge_key
                                           },function(err,refund){

                                             if(err)
                                             res.json({succes:false,message:err});
                                             else{

                                               NonRepeatableActivityReservation.remove({_id:reservation._id},function(err){
                                                 if(err)
                                                      res.json({succes:false,message:err});
                                                  else{

                                                      res.json({success:true ,message:"Reservation Deleted Successfuly"});
                                                 }
                                               });
                                             }
                                           });

                                 }
                            }

                        });
                      }
                    });
         }
       }


};

module.exports = ReservationController;
