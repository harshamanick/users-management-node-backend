export const constructUserData = (data) => {
  const {
    firstname,
    dob,
    address,
    phone,
    state,
    zip,
    email,
    gender,
    userType,
  } = data;

  return {
    first_name: firstname,
    DOB: dob,
    address,
    phone_number: phone,
    state,
    zip_code: zip,
    email,
    gender,
    user_type: userType,
  };
};

export const constructPolicyInfo = (data) =>{
    const{policy_number, policy_start_date, policy_end_date, policy_type }=data
    return{
        policy_number,
        policy_start_date,
        policy_end_date,
        policy_category: policy_type,
    }
}

export function dateToCronPattern(date) {
    const second = date.getSeconds();
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; 
    const dayOfWeek = date.getDay();
  
    return `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }