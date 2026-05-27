import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<object> = {
  prefixes: ['/'],
  config: {
    screens: {
      Landing: '',
      Login: 'login',
      SignUp: 'signup',
      Jobs: {
        screens: {
          EmployerHome: 'employer',
          EmployeeHome: 'jobs',
          PostJob: 'employer/post',
          Applicants: 'employer/applicants/:jobId',
        },
      },
      Profile: 'profile',
    },
  },
};
