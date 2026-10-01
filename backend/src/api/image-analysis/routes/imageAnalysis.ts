export default {
  routes: [
    {
      method: "POST",
      path: "/image-analyze",
      handler: "image-analysis.analyze",
      config: {
        auth: false,
      },
    },
  ],
};