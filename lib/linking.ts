import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<object> = {
  prefixes: [typeof window !== 'undefined' ? window.location.origin : '/', '/'],
  config: {
    screens: {
      Landing: '',
      Login: 'login',
      SignUp: 'signup',
      Jobs: {
        screens: {
          EmployeeHome: 'jobs',
          ApplyJob: 'jobs/apply/:jobId',
          EmployerHome: 'employer',
          FindWorkers: 'employer/find-workers',
          PostJob: 'employer/post',
          Applicants: 'employer/applicants/:jobId',
        },
      },
      Profile: 'profile',
    },
  },
};