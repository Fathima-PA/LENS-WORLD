export const calculateDiscountPrice = (price, offer) => {

  if (!offer) return price;

  if (offer.discountType === "percentage") {
    return price - (price * offer.discountValue) / 100;
  }

  if (offer.discountType === "flat") {
    return Math.max(price - offer.discountValue, 0); 
  }

  return price;
};


export const getBestOfferPrice = (price, productOffer, categoryOffer) => {

  const productPrice = calculateDiscountPrice(price, productOffer);
  const categoryPrice = calculateDiscountPrice(price, categoryOffer);

  return Math.min(productPrice, categoryPrice);

};