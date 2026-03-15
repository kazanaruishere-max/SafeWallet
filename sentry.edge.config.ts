import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://cba4c91c5aeed01f6db3707c8a3b04f6@o4511008115261440.ingest.us.sentry.io/4511046561169408",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
