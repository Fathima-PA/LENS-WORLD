export const generateReferralCode = (username) => {

  const prefix = username.substring(0,3).toUpperCase();

  const random = Math.random()
    .toString(36)
    .substring(2,6)
    .toUpperCase();

  return prefix + random;

};