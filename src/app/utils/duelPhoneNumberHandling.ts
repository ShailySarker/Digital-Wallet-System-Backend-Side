import { User } from "../modules/user/user.model";

export const duelPhoneNumberHandling = async(phone : string) => {
    let searchPhoneVariants: string[] = [];
    
      // If phone is 11 digits → e.g. 017XXXXXXXX
      if (phone.length === 11) {
        searchPhoneVariants = [phone, `+88${phone}`];
      }
    
      // If phone is 14 digits → e.g. +88017XXXXXXXX
      else if (phone.length === 14 && phone.startsWith("+88")) {
        const withoutPrefix = phone.slice(3); // remove +88
        searchPhoneVariants = [phone, withoutPrefix];
      }
    
      // Search in DB for either format
      const user = await User.findOne({
        phone: { $in: searchPhoneVariants },
      });
    
    
      return user;
    
}