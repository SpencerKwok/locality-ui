/*
Heroku pipeline does not rebuild the application on
promotion, so we need to set the environment variables
on run-time here so a release will set the correct
environment variables
*/

export const ALGOLIASEARCH_API_KEY = process.env.ALGOLIASEARCH_API_KEY;
export const ALGOLIASEARCH_API_KEY_SEARCH = process.env.ALGOLIA_API_KEY_SEARCH;
export const ALGOLIASEARCH_APPLICATION_ID =
  process.env.ALGOLIASEARCH_APPLICATION_ID;
export const ALGOLIASEARCH_INDEX = process.env.ALGOLIASEARCH_INDEX;
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
export const DATABASE_URL = process.env.DATABASE_URL;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
export const EMAIL_USER = process.env.EMAIL_USER;
export const ETSY_API_KEY = process.env.ETSY_API_KEY;
export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
export const GOOGLE_ANALYTICS_API_SECRET =
  process.env.GOOGLE_ANALYTICS_API_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_MEASUREMENT_ID = process.env.GOOGLE_MEASUREMENT_ID;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_SIGNING_KEY = process.env.JWT_SIGNING_KEY;
export const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
export const MAILCHIMP_LOCALITY_ID = process.env.MAILCHIMP_LOCALITY_ID;
export const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER;
export const MAPQUEST_KEY = process.env.MAPQUEST_KEY;
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
export const NEXT_TELEMETRY_DISABLED = process.env.NEXT_TELEMETRY_DISABLED;
export const NODE_ENV = process.env.NODE_ENV;
export const REDIS_TLS_URL = process.env.REDIS_TLS_URL;
export const REDIS_URL = process.env.REDIS_URL;
export const SALT = process.env.SALT;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const SQREEN_APP_NAME = process.env.SQREEN_APP_NAME;
export const SQREEN_TOKEN = process.env.SQREEN_TOKEN;
export const SUMOLOGIC_URL = process.env.SUMOLOGIC_URL;
