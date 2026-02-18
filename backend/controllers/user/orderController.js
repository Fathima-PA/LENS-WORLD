import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Address from "../../models/AddressModel.js";
import Order from "../../models/OrderModel.js";

export const placeOrderCOD = async (req,res)=>{
  try{

    const userId = req.user._id;

    const cart = await Cart.findOne({userId}).populate("items.productId");
    if(!cart || cart.items.length===0)
      return res.status(400).json({message:"Cart is empty"});
    for(const item of cart.items){

      const product = item.productId;

      if(!product || !product.isActive)
        return res.status(400).json({message:"Some products unavailable"});

      const variant = product.variants.id(item.variantId);

      if(!variant || variant.stock < item.quantity)
        return res.status(400).json({message:"Stock changed, please review cart"});
    }
    const addressDoc = await Address.findOne({user:userId,isDefault:true});
    if(!addressDoc)
      return res.status(400).json({message:"Please select address"});

    let subtotal=0;
    const orderItems=[];

    for(const item of cart.items){

      const product = item.productId;
      const variant = product.variants.id(item.variantId);

      const total=item.price*item.quantity;
      subtotal+=total;

      orderItems.push({
        productId:product._id,
        name:product.name,
        image:variant.images?.[0]||"",
        price:item.price,
        quantity:item.quantity,
        total
      });
    }

    const tax=Math.round(subtotal*0.18);
    const shipping=0;
    const discount=subtotal>5000?500:0;
    const grandTotal=subtotal+tax+shipping-discount;

    const order=await Order.create({
      user:userId,
      items:orderItems,
      address:{
        address:addressDoc.address,
        city:addressDoc.city,
        state:addressDoc.state,
        phone:addressDoc.phone,
        pincode:addressDoc.pincode
      },
      subtotal,
      tax,
      shipping,
      discount,
      grandTotal
    });

    for(const item of cart.items){
      const product=await Product.findById(item.productId._id);
      const variant=product.variants.id(item.variantId);
      variant.stock-=item.quantity;
      await product.save();
    }
    cart.items=[];
    await cart.save();

    res.json({success:true,orderId:order._id});

  }catch(err){
    console.error(err);
    res.status(500).json({message:"Order failed"});
  }
};
