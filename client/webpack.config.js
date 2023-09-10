const path = require("path");
const PerspectivePlugin = require("@finos/perspective-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.tsx",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "build"),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
				  'style-loader',
				  'css-loader'
				]
			 },
			 {
				test: /\.(png|jpe?g|gif)$/i,
				use: [
				  {
					 loader: 'file-loader',
				  },
				],
			 },
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
	 new PerspectivePlugin()
  ],
};