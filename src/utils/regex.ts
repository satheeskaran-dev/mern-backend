export const REGEX = {
  PASSWORD: {
    RULE: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    MSG: 'Password should be minimum eight characters, at least one letter , one number and one special character',
  },
};
