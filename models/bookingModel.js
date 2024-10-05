import mongoose from "mongoose";
const bookingSchema = mongoose.Schema(
  {
    user_id:{type:String,required:true},
    bdm:{type:String,required:true},
    branch_name: { type: String, required: true },
    company_name: { type: String, required: true },
    contact_person: { type: String, required: true },
    email: { type: String, required: true },
    contact_no:{type:Number,required:true},
    services:{type:String,required:true},
    total_amount:{type:Number,required:true},
    term_1:{type:Number},
    term_2:{type:Number},
    term_3:{type:Number},
    term_1_payment_date:{type:String},
    term_2_payment_date:{type:String},
    term_3_payment_date:{type:String},
    pan:{type:String},
    gst:{type:String},
    remark:{type:String},
    date: { type: Date, required: true },
    bank:{type:String},
    status:{type:String}
  },
  { versionKey: false },
  { timestamps: false }
);
export  const BookingModel = mongoose.model("booking", bookingSchema);
