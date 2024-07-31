// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const createExpoWebpackConfigAsync = require("@expo/webpack-config");

const isProduction = process.env.NODE_ENV == "production";

const getExpoConfig = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  const mod = env.mod; //argv.find((arg) => arg.startsWith("--mod=")).split("=")[1];
  const ENTRY_POINTS = {
    TransmutableCaliburn: "./src/TransmutableCaliburn/index.ts",
  };
  config.entry = ENTRY_POINTS[mod];

  config.output = {
    path: path.resolve(__dirname, "dist", mod),
    library: {
      type: "this",
    },
    filename: `${mod}.js`,
  };

  // Max image size 999 MB
  config.module.rules[1].oneOf[0].parser.dataUrlCondition.maxSize = 999999999;
  config.module.rules[1].oneOf[1].parser.dataUrlCondition.maxSize = 999999999;

  config.optimization = {
    minimize: isProduction,
  };

  return config;
};

module.exports = async function (env, argv) {
  env.mode = !isProduction ? "development" : "production";
  const config = await getExpoConfig(env, argv);
  // config.mode = "production";
  return config;
};
