const mongoose = require ('mongoose')

const passengerSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:[true,'Please enter the refund name']
    },
    weight:{
        type:String,
        required:[true, 'Please enter passenger weight']
    },
    cid: {
        type:String,
        required: [true, 'Please enter the cid']
    },
    bagWeight:{
        type:String,
        required:[true, 'Please enter baggage weight']
    },
    gender:{
        type:String,
        required:[true, 'Please enter gender']
    },
    medIssue:{
        type:String,
    },
    contact:{
        type:String,
        required:[true, 'Please enter contact number']
    },
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    }
})

const Passenger = mongoose.model('Passenger', passengerSchema)
module.exports = Passenger